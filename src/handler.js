const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const WebsocketClient = require('./WebsocketClient');
const wsClient = new WebsocketClient();

const success = {
    statusCode: 200,
}


//keep the dynamodb populated with all clients.
const connectionHandler = async (event, context) => {
    if (event.requestContext.eventType === "CONNECT") {
        await ddb.put({
            TableName: process.env.APPLICATION_TABLE,
            Item: {
                connectionId: event.requestContext.connectionId
            }
        }).promise();
    } else if (event.requestContext.eventType === "DISCONNECT") {
        await ddb.delete({
            TableName: process.env.APPLICATION_TABLE,
            Key: {
                connectionId: event.requestContext.connectionId
            }
        }).promise();
    }
    return success;
}

const videoHandler = async (event, context) => {
    const payload = JSON.parse(event.body);
    if (payload.videoId) {
        let connections = await ddb.scan({
            TableName: process.env.APPLICATION_TABLE
        }).promise();
        const clients = connections.Items

        const messages = clients.map(async (client) => {
            return wsClient.send(event, client.connectionId, {
                video: `https://${process.env.VIDEO_BUCKET}.s3.amazonaws.com/${payload.videoId}.mp4`
            })
        })

        await Promise.all(messages);
    }
    return success;

}

module.exports = {
    connectionHandler,
    videoHandler
}