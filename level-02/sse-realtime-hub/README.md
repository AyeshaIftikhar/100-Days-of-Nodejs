# SSE Realtime Hub

## What is Server-Sent Event (SSE)

A Server-Sent Event (SSE) is a one-way communication channel where a server can continuously push real-time updates to a client (usually a browser) over a single long-lived HTTP connection.

Unlike traditional HTTP requests (which are request-response based), SSE keeps a connection open so the server can stream events/data to the client as they happen.

## 🔑 Key Points about SSE:

- One-way communication → Server ➝ Client (not Client ➝ Server).
- Uses a persistent HTTP connection (no need for WebSockets).
- The client receives updates automatically without polling.
- SSE uses the text/event-stream MIME type.
- Supported natively in browsers via the EventSource API (JavaScript).

This is a production-ready **Server-Sent Events (SSE)** hub for **real-time order/status notifications**. It supports:

- **Channels** (e.g., `orders/123`, `builds/my-service`, `support/queue`)
- **Replay on reconnect** using `Last-Event-ID` (in-memory ring buffer)
- **API key–protected publishing** via REST
- **Demo web UI** in `/public`
- **Health** and **stats** endpoints
- **Docker** support

> Real-world fit: live order tracking, CI/CD job updates, IoT sensor feeds, stock/crypto tickers, support queue positions, moderation queues, etc.

---

## Why SSE (vs WebSockets)?

- **Simple**: Native browser `EventSource`, no client library required.
- **One-way push** from server to client—ideal for status feeds/notifications.
- **Proxy/cache friendly**, lower overhead, great for many “fan-out” scenarios.
- **Auto-reconnect** and `Last-Event-ID` built into the spec.

If you need **bi-directional** messaging, consider WebSockets. For **many-to-one** broadcast with simple clients, SSE shines.

---

## Quick Start

### 1) Requirements

- Node.js **18+**

### 2) Install

```bash
npm ci
```

### 3) Configure

Create .env:

```bash
cp .env.example .env
```

then edit API_KEY, etc.

### 4) Run (dev)

```bash
   npm run dev
```

### 5) Open the demo

Visit: http://localhost:3000
Click Connect (default channel orders/demo).

### 6) Publish events (simulate)

In a separate terminal:

```bash
curl -X POST http://localhost:3000/simulate \
 -H "Content-Type: application/json" \
 -H "x-api-key: change-me" \
 -d '{ "channel": "orders/demo", "count": 5, "delayMs": 800 }'
```

You should see live updates flow into the browser.

## API

### Subscribe (SSE)

```bash
GET /events?channel=<name>
GET /events/:channel
Headers:
Accept: text/event-stream
(optional) Last-Event-ID: <number> # for replay after reconnect
```

**Response:** text/event-stream with events like:

```bash
retry: 3000
id: 42
event: status
data: {"status":"processing","step":2,"total":5,"at":"2025-08-18T09:00:00.000Z"}
```

## Publish

```bash
POST /publish
Headers:
x-api-key: <API_KEY>
Body (JSON):
{
"channel": "orders/123",
"event": "status",
"data": { "status": "packing", "step": 3, "total": 5 }
}
```

## Simulate (demo helper)

```bash
POST /simulate
Headers:
x-api-key: <API_KEY>
Body (JSON):
{ "channel": "orders/demo", "count": 5, "delayMs": 800 }
```

## Health & Stats

```bash
GET /health
GET /stats
```

## Last-Event-ID & Replay

This hub maintains a per-channel ring buffer (HISTORY_LIMIT) of recent events.
Clients that reconnect automatically send Last-Event-ID, so the server will replay any missed events with id > Last-Event-ID.

**_⚠️ Note:_** Browser EventSource auto-handles Last-Event-ID on reconnects. If you implement a custom client, set the header manually when reconnecting.

## Deploy with Docker

```bash
docker build -t sse-realtime-hub .
docker run -p 3000:3000 --env-file .env sse-realtime-hub
```

## Security Notes

- Publishing requires x-api-key. Rotate and store the key securely (e.g., environment secrets).
- For public projects, consider a separate ingress for /publish restricted to your backend network.

## Scalability

- This demo uses an in-memory bus. For multiple instances or high fan-out:
- Use Redis Pub/Sub (or NATS/Kafka) for cross-instance fan-out.
- Consider sticky sessions or an edge cache that supports SSE pass-through.
- Terminate SSE at a service that supports HTTP/1.1 keep-alive with long timeouts.

## Real-World Use Cases

- E-commerce order tracking (customer sees live status change)
- Support queue position (live number as it moves)
- CI/CD pipeline updates (build started → tests → deploy)
- IoT telemetry (latest sensor readings, alarms)
- Moderation dashboards (new reports stream in)

## Future Enhancements

- Pluggable Redis Pub/Sub adapter for horizontal scaling
- AuthN/AuthZ on /events (JWT → channel ACLs)
- Per-channel TTLs and persistence to a datastore
- Metrics (Prometheus) and structured logs
- Backpressure controls and per-client rate limiting
- Multi-tenant namespaces and quotas
- TypeScript + tests (Vitest/Jest)
