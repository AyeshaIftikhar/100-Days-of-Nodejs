import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isOffline = process.env.IS_OFFLINE === 'true' || process.env.IS_OFFLINE === '1';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: isOffline || process.env.DYNAMO_ENDPOINT ? (process.env.DYNAMO_ENDPOINT || 'http://localhost:8000') : undefined
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: false }
});
