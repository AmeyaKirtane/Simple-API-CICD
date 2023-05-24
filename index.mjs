import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
  
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "First_Serverless_App_movies";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };
  try {
    switch (event.routeKey) {
      case "DELETE /movies/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: parseInt(event.pathParameters.id),
            },
          })
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /movies/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: parseInt(event.pathParameters.id),
            },
          })
        );
        body = body.Item;
        break;
      case "GET /movies":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      case "PUT /movies":
        let requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: requestJSON.id,
              name: requestJSON.name,
              director: requestJSON.director,
            },
          })
        );
        body = `Put item ${requestJSON.id}`;
        break;
      case "PUT /movies/{id}":
          let UpdateRequestJSON = JSON.parse(event.body);
          await dynamo.send(
              new PutCommand({
                  TableName: tableName, 
                  Item: {
                      id: parseInt(event.pathParameters.id),
                      name: UpdateRequestJSON.name, 
                      director: UpdateRequestJSON.director,
                  },
              }));
              body = 'Changed item $(event.pathParameters.id)';
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  return {
    statusCode,
    body,
    headers,
  };
};
