
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

type Todo = {
    id: string;
    Description: string;
    
}


async function getTodo(id: String): Promise<Todo | undefined> {
    const params = {
        TableName: process.env.TODOTableName,
        Item: id
    }
    try {
        const response = await docClient.scan(params).promise();
        return response.AttributeType;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return undefined;
    }
}

export default getTodo;