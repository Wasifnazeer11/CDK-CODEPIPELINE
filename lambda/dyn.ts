import { DynamoDB } from 'aws-sdk'
const docClient = new DynamoDB.DocumentClient();


interface AppSyncEvent {
    info: {
        fieldName: String
    },
    arguments: {
        product: Product
        productID: String
    }

}
type Product = {
    id: String,
    name: String,
    price: Number
}



exports.handler = async(event: AppSyncEvent) => {
    if(event.info.fieldName === 'welcome'){
        return "Hello Dynamodb world";
    }else if(event.info.fieldName === 'addProduct'){
        event.arguments.product.id = "key- "+Math.random();

        const params = {
            TableName: process.env.TodosTable_Name || " ",
            Item: event.arguments.product
        }

        const data = await docClient.put(params).promise();
        console.log("After Data",data);
        return event.arguments.product;

    }
    else if(event.info.fieldName === 'delProduct'){
        const params = {


            TableName: process.env.TodosTable_Name || " ",
            Key: {
                   id: event.arguments.productID
        
        }}

        const data = await docClient.delete(params).promise();
        // console.log("After Delete",data);
        return "Deleted";

    }
    else if(event.info.fieldName == 'getProduct'){
        const params = {
            TableName: process.env.TodosTable_Name || " ",
            Key: {
                   id: event.arguments.productID
        
        }}

        const data = await docClient.get(params).promise();
        // console.log("After Delete",data);
        return data.Item;

    }else if(event.info.fieldName === 'updateProduct'){
       

        const params = {
            TableName: process.env.TodosTable_Name || " ",
            Key: {
                   id: event.arguments.product.id
        },
            UpdateExpression: 'SET price = :newPrice ',
            ExpressionAttributeValues: {
            ':newPrice': event.arguments.product.price,
          },
}

        const data = await docClient.update(params).promise();
        console.log("After Update Data",data);
        return "Updated";

    }
    else{
        return "Data Not FOund";
    }
}
 