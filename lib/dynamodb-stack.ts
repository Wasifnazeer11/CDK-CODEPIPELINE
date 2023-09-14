import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { Effect, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';



export class DynamodbStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
      name: 'Dyno-Sync-Lam-api',
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),       ///Path specified for lambda
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,     ///Defining Authorization Type
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))   ///set expiration for API Key
          }
        },
      },
      xrayEnabled: true                                             ///Enables xray debugging
    })

     ///Print Graphql Api Url on console after deploy
     new cdk.CfnOutput(this, "APIGraphQlURL", {
      value: api.graphqlUrl
    })

    ///Print API Key on console after deploy
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    const role = new Role(this, "My role",{
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
    ///Lambda Fucntion
    const lambda_function = new lambda.Function(this, "Dynamodb-LambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_14_X,            ///set nodejs runtime environment
      code: lambda.Code.fromAsset("lambda"),          ///path for lambda function directory
      handler: 'dyn.handler',          
      role: role,             ///specfic fucntion in specific file
      timeout: cdk.Duration.seconds(10)               ///Time for function to break. limit upto 15 mins
    })

    const lambda_data_source = api.addLambdaDataSource("lamdaDataSource", lambda_function);

    const TODOTable = new ddb.Table(this, 'CDKTODOTable',{
      tableName: "TodosTable",
      partitionKey:{
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });
    TODOTable.grantFullAccess(lambda_function);
    lambda_function.addEnvironment('TodosTable_Name', TODOTable.tableName )

      

      const policy = new PolicyStatement({
        effect: Effect.DENY,
        actions: ['dynamodb:GetItem', 'logs:*'],
        resources: [TODOTable.tableArn]
      });

      role.addToPolicy(policy);





    ///Describing resolver for datasource
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "welcome"
    })
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "getProduct"
    })

 
    
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "addProduct"
    })

    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "delProduct"
    })
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "updateProduct"
    })


    


    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'DynamodbQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
