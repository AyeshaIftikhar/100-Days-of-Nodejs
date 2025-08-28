# Serverless Orders API + Webhooks (DynamoDB)

This project demonstrates a **serverless architecture** for building scalable applications with **Node.js**, **AWS Lambda**, and **DynamoDB**. It includes a **CRUD API** for managing items in DynamoDB and a **Webhook endpoint** to receive and process external events. The solution is designed for real-world use cases such as order tracking, payment updates, or event-driven notifications, providing a reliable and cost-efficient way to manage API requests without managing servers.

By leveraging the **Serverless Framework**, this project can be deployed to AWS quickly, with infrastructure-as-code, and can also be tested locally using Docker and the AWS SAM CLI.

### Update Order

```bash
curl -X PUT http://localhost:3000/orders/<id> \
-H 'Content-Type: application/json' \
-d '{"status":"SHIPPED","total":1099.00}'
```

### Delete Order

```bash
curl -X DELETE http://localhost:3000/orders/<id>
```

## Webhook (Payment)

The webhook expects:

- Header: `x-signature` = `hex(HMAC_SHA256(rawBody, WEBHOOK_SECRET))`
- Body JSON: `{ "event": "payment.succeeded", "orderId": "<id>", "amount": 999 }`

Example:

```bash
BODY='{"event":"payment.succeeded","orderId":"abc123","amount":999}'
SIG=$(node -e "console.log(require('crypto').createHmac('sha256', process.env.WEBHOOK_SECRET||'change-me').update(process.env.BODY||'${BODY}','utf8').digest('hex'))")
curl -X POST http://localhost:3000/webhooks/payment \
-H 'Content-Type: application/json' \
-H "x-signature: ${SIG}" \
-d "${BODY}"
```

This will upsert the order `abc123` and set its `status` to `PAID`.

Events handled:

- `payment.succeeded` → `PAID`
- `payment.failed` → `FAILED`
- `payment.refunded` → `REFUNDED`

## Deploy to AWS

Make sure your AWS credentials are configured (e.g., with `aws configure`).

1. Adjust `.env` for cloud (set `WEBHOOK_SECRET`, `TABLE_NAME`, `AWS_REGION`).
2. Deploy:

```bash
npm run deploy
```

3. Note the HTTP API endpoint printed after deploy and use the same routes as local.
4. To remove:

```bash
npm run remove
```

> Security tip: use a secrets manager/SSM Parameter Store for `WEBHOOK_SECRET` in production and pass it via environment or Serverless variables.

## Project Structure

- `src/handlers/items.js` — CRUD Lambdas for `/orders` routes.
- `src/handlers/webhook.js` — Webhook Lambda for `/webhooks/payment` with HMAC verification.
- `src/lib/dynamo.js` — DynamoDB client (switches to local endpoint when offline).
- `scripts/setup-local-dynamodb.js` — Creates the table in DynamoDB Local for development.

## Future Enhancements

- **Idempotency keys**: handle duplicate webhook deliveries with an events table.
- **Auth**: add JWT auth or API keys for CRUD endpoints.
- **Validation**: enforce schemas with `ajv` and API Gateway request validators.
- **Observability**: integrate CloudWatch structured logs and X-Ray tracing.
- **CI/CD**: GitHub Actions to lint, test, and deploy on push.
- **SQS**: queue webhook processing for resilience.
- **GSI**: add `status` index to query orders by status.
- **Rate limiting**: API Gateway usage plans.
