const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type Todo = {
    id: String;
    desc: String;

   
}


async function addTodo(desc: Todo) : Promise<any | undefined> {
    const params = {
        TableName: process.env.TODOTableName,
        Item: desc
    }
    try {
        const response = await docClient.put(params).promise();
        return response.AttributeType.desc;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return undefined;
    }
}

export default addTodo;