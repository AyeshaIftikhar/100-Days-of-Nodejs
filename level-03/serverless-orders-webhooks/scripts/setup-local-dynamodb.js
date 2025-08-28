import { DynamoDBClient, ListTablesCommand, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';
const endpoint = process.env.DYNAMO_ENDPOINT || 'http://localhost:8000';
const tableName = process.env.TABLE_NAME || 'OrdersTable-dev';

const client = new DynamoDBClient({ region, endpoint });

async function ensureTable() {
  const tables = await client.send(new ListTablesCommand({}));
  if (tables.TableNames.includes(tableName)) {
    const d = await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log('DynamoDB table exists:', d.Table.TableName);
    return;
  }
  console.log('Creating table', tableName);
  await client.send(new CreateTableCommand({
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }]
  }));
  console.log('Table creation initiated.');
}

ensureTable().catch((e) => { console.error(e); process.exit(1); });
