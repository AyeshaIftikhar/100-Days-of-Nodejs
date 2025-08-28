import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { ok, bad } from '../lib/response.js';
import { nanoid } from 'nanoid';

const TABLE_NAME = process.env.TABLE_NAME;

const parseBody = (event) => {
  try {
    return event?.isBase64Encoded
      ? JSON.parse(Buffer.from(event.body || '', 'base64').toString('utf8'))
      : JSON.parse(event.body || '{}');
  } catch {
    return null;
  }
};

export const create = async (event) => {
  const data = parseBody(event);
  if (!data) return bad('Invalid JSON');

  const id = data.id || nanoid();
  const now = new Date().toISOString();
  const item = {
    id,
    customerName: data.customerName || 'Unknown',
    status: data.status || 'PENDING',
    total: Number(data.total || 0),
    createdAt: now,
    updatedAt: now
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return ok(item, 201);
};

export const get = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return bad('Missing id');
  const res = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
  if (!res.Item) return bad('Not found', 404);
  return ok(res.Item);
};

export const list = async () => {
  const res = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  return ok({ items: res.Items || [] });
};

export const update = async (event) => {
  const id = event.pathParameters?.id;
  const data = parseBody(event);
  if (!id) return bad('Missing id');
  if (!data) return bad('Invalid JSON');

  const allowed = ['customerName', 'status', 'total'];
  const fields = Object.keys(data).filter((k) => allowed.includes(k));
  if (fields.length === 0) return bad('No updatable fields provided');

  const now = new Date().toISOString();
  let UpdateExpression = 'SET updatedAt = :now';
  const ExpressionAttributeValues = { ':now': now };
  const ExpressionAttributeNames = {};

  fields.forEach((f, i) => {
    const nameKey = `#f${i}`;
    const valueKey = `:v${i}`;
    UpdateExpression += `, ${nameKey} = ${valueKey}`;
    ExpressionAttributeNames[nameKey] = f;
    ExpressionAttributeValues[valueKey] = f === 'total' ? Number(data[f]) : data[f];
  });

  const res = await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    ReturnValues: 'ALL_NEW'
  }));
  return ok(res.Attributes || {});
};

export const remove = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return bad('Missing id');
  await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
  return ok({ deleted: true });
};
