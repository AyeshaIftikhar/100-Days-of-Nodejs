# Real-Time Analytics Dashboard

A simple, production-ready starting point for a real-time analytics dashboard using Node.js, Express, Socket.IO and optional Redis for cross-instance pub/sub. The project includes a fake data generator for demo/testing.

## What problem this solves

This dashboard lets product/ops teams view live metrics (active users, events/sec, error rate, latency) and visualize trends in real time. It's useful for monitoring web apps, APIs, IoT devices, or any event stream.

## Features

- Real-time metrics delivered via Socket.IO (WebSockets fallback)
- Simple responsive frontend with Chart.js
- Optional Redis pub/sub for scaling across instances (via `ioredis`)
- Dockerfile + docker-compose for local orchestration
- Simple fake data generator to simulate metrics

## Files

See project structure.

## Requirements

- Node.js 18+ (tested on Node 20)
- npm
- Docker & Docker Compose (optional, recommended if you want Redis)

## Setup (local, without Docker)

1. Clone or copy the project files.
2. `cp .env.example .env` and edit if desired.
3. Install:

```bash
   npm ci
```

4. Start:

```bash
npm start
```

5. Open http://localhost:4000/ in your browser.

## Setup (Docker + Redis)

- Ensure Docker & Docker Compose are installed.

- From project root:

```bash
docker-compose up --build
```

- Open http://localhost:4000/.

When using Docker Compose, USE_REDIS is set to true by default in docker-compose.yml so the server will publish metrics to Redis which enables scaling.

## Dev mode

- For development with live reload:

```bash
npm install
npm run dev
```

## How it works (high-level)

- `src/server.js` runs an Express server and sets up Socket.IO.
- `src/socketHandlers.js` manages client subscriptions and (optionally) connects to Redis for pub/sub.
- `src/dataGenerator.js` simulates metric events at the configured interval and sends them to connected clients via io.broadcastMetrics.
- Frontend (in public/) listens to metrics events and updates charts.

## Environment variables

- PORT - server port (default 4000)
- USE_REDIS - true or false
- REDIS_URL - e.g., redis://redis:6379
- DATA_GENERATOR_INTERVAL_MS - e.g., 1000

## Production considerations

- Replace fake generator with real metrics source (Kafka, Kinesis, app instrumentation).
- Add authentication & authorization for dashboard access.
- Add persistence or TSDB (Prometheus, InfluxDB) for historical queries.
- Add alerting rules and notification integrations (e.g., Slack, PagerDuty).
- Use HTTPS and a reverse proxy (Nginx) in front of app servers.
- Use Socket.IO adapter (socket.io-redis or Redis adapter) for multi-instance scaling.

## Future enhancements

- Auth (JWT / OAuth) and role-based access control for dashboards and streams.
- Multi-tenant support — isolate streams per team/customer.
- Integration with real streaming backends (Kafka, RabbitMQ, AWS Kinesis).
- Persistence: store metrics in a TSDB (Prometheus/InfluxDB) and display historical charts and queries.
- Alerting: thresholds & notifications (email, Slack, SMS).
- More widgets: percentile latency, heatmaps, geographical maps, drill-downs.
- UI: Add filters, time-range selector, and chart customization.
- Use socket.io-redis adapter (if needed) for clustering and horizontal scaling.
- Add tests (unit + integration) and CI pipeline; container image scanning.
