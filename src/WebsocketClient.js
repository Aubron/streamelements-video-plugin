const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

class WebsocketClient {
    constructor() {
        this.client = new AWS.ApiGatewayManagementApi({
            endpoint: process.env.GW_URL
        })
    }
    send = async (event, connectionId, payload) => {

        console.log(this.client);

        console.log({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        })

        await this.client.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise().catch( async err => {
            console.log(JSON.stringify(err))
            if (err.statusCode === 410) {
                //disconnect client
                console.log('Stale connection discovered: ',connectionId);
                await ddb.delete({
                    TableName: process.env.APPLICATION_TABLE,
                    Key: {
                        connectionId
                    }
                }).promise()
                console.log('Removed connection: ',connectionId);
            }
        })

    }
}
module.exports = WebsocketClient