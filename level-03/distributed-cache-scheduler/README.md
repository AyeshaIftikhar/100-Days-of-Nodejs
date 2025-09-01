# Distributed Cache + Task Scheduler

Real-world problem solved: Multi-instance services often need a shared cache and a robust mechanism to schedule and run tasks (recurring or one-off). This project provides a centralized Redis-backed cache, a REST API to set/get/refresh cache, endpoints to schedule tasks (one-off or recurring), and worker processes that execute jobs reliably and in a distributed environment. It also demonstrates using distributed locks via Redlock.

A small Node.js project demonstrating a distributed cache (Redis) and a task scheduler using BullMQ. Designed for multi-instance deployments where multiple workers/processes need to share cache and reliably run scheduled jobs.

## Features

- Redis-based cache (get/set/del)
- HTTP API to set/get cache keys
- Schedule jobs: immediate, one-off (runAt), recurring (cron or every ms)
- Worker process to execute jobs
- Example job handlers: `refresh-cache`, `log-message`
- Distributed lock example using Redlock
- Docker Compose to run Redis + app + worker locally

## Requirements

- Docker & Docker Compose OR Node.js >= 18 and a Redis server
- npm

## Run with Docker Compose (recommended)

```bash
git clone <this-repo>
cd distributed-cache-scheduler
# Build and start app + worker + redis
docker-compose up --build
```

- API available at http://localhost:3000
- Worker logs appear in worker container

## Run locally (without Docker)

- Start Redis (e.g., redis-server or docker run -p 6379:6379 redis:7)

- Copy `.env.example -> .env` and set REDIS_URL if needed.

## Install dependencies:

```bash
npm ci
```

### Start app:

```bash
npm run start

# or in development mode:

npm run dev
```

### Start worker in another terminal:

```bash
npm run worker
```

## API

### Health

#### GET /health

Response:

```json
{ "status": "ok", "time": "..." }
```

#### Set cache

POST /cache

Body:

```json
{
  "key": "user:123",
  "value": { "name": "Ayesha" },
  "ttl": 60
}
```

#### Get cache

GET /cache/:key

#### Schedule job

POST /schedule

##### Body examples:

- Immediate:

```json
{ "name": "log-message", "payload": { "msg": "hello" } }
```

- One-off (run a timestamp in ms):

```json
{
  "name": "refresh-cache",
  "payload": { "key": "common" },
  "runAt": 1690000000000
}
```

- Cron:

```json
{
  "name": "refresh-cache",
  "payload": { "key": "common" },
  "cron": "_/5 _ * * *"
}
```

- Every N ms:

```json
{ "name": "refresh-cache", "payload": { "key": "common" }, "everyInMs": 60000 }
```

## Distributed lock example

```bash
POST /refresh-cache-with-lock
```

- Body:

```json
{ "key": "some-key" }
```

Attempts to acquire a distributed lock before refreshing cache.

## Example curl flows

### Set cache:

```bash
curl -X POST http://localhost:3000/cache -H "Content-Type: application/json" -d '{"key":"demo","value":{"hello":"world"},"ttl":30}'
```

### Get cache:

```bash
curl http://localhost:3000/cache/demo
```

### Schedule recurring job (every minute):

```bash
curl -X POST http://localhost:3000/schedule -H "Content-Type: application/json" -d '{"name":"refresh-cache","payload":{"key":"demo"},"everyInMs":60000}'
```

## Notes & design considerations

- BullMQ handles repeatable jobs across multiple workers. Use jobId to make certain jobs idempotent or to prevent duplicates.
- Use Redlock when you need a strict distributed lock beyond BullMQ's job guarantees (e.g., for ad-hoc tasks initiated from multiple services).
- scheduler.init() is invoked by the HTTP server to make queue/scheduler available; the worker runs initWorker() to create a Worker that processes jobs.
- Jobs use JSON payloads—keep handlers idempotent to tolerate retries.

## Future enhancements

- Authentication — Add API auth (JWT / API keys) to secure scheduling and cache endpoints.
- Monitoring — Integrate Bull Board / Arena or a Prometheus exporter for job/queue/redis metrics.
- Persistence & clustering — Use Redis cluster for high availability and resilience.
- Distributed tracing — Add OpenTelemetry for tracing across services and job runs.
- Job retry strategies & alerts — Add advanced retry/backoff policies, dead-letter queue and notifications (Slack/email).
- Role-based scheduling — Add RBAC to allow only specific services/users to schedule certain jobs.
- Dashboard — A small UI to view and manage scheduled jobs and cache keys.
- TypeScript rewrite — Improve DX and reliability by using TypeScript and validating job payloads.
- Autoscaling — Add a mechanism to autoscale workers based on queue backlog.
- Persistence for job metadata — Store job metadata and history in a relational DB for audit.
