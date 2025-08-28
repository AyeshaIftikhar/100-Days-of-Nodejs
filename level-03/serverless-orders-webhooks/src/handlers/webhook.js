import crypto from 'crypto';
import { UpdateCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { ok, bad } from '../lib/response.js';

const TABLE_NAME = process.env.TABLE_NAME;
const SECRET = process.env.WEBHOOK_SECRET || '';

const parseBodyRaw = (event) => {
  const raw = event?.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  let json = null;
  try { json = JSON.parse(raw || '{}'); } catch {}
  return { raw, json };
};

const safeTimingEqual = (a, b) => {
  const bufA = Buffer.from(a || '', 'utf8');
  const bufB = Buffer.from(b || '', 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

const computeSignature = (payload, secret) => {
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
};

export const payment = async (event) => {
  if (!SECRET) return bad('Webhook secret not configured', 500);

  const sigHeader = event.headers?.['x-signature'] || event.headers?.['X-Signature'];
  const { raw, json } = parseBodyRaw(event);
  if (!sigHeader) return bad('Missing signature header');
  const expected = computeSignature(raw, SECRET);
  if (!safeTimingEqual(expected, sigHeader)) return bad('Invalid signature', 401);

  const orderId = json?.orderId;
  if (!orderId) return bad('Missing orderId');

  const status = json?.event === 'payment.succeeded' ? 'PAID'
    : json?.event === 'payment.refunded' ? 'REFUNDED'
    : json?.event === 'payment.failed' ? 'FAILED'
    : 'PENDING';

  const existing = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id: orderId } }));
  const now = new Date().toISOString();
  if (!existing.Item) {
    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: orderId,
        customerName: json?.customerName || 'Unknown',
        total: Number(json?.amount || 0),
        status,
        createdAt: now,
        updatedAt: now
      }
    }));
  } else {
    await ddb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: orderId },
      UpdateExpression: 'SET #status = :s, updatedAt = :now',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':s': status, ':now': now }
    }));
  }

  return ok({ ok: true, orderId, status });
};
