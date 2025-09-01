# ELK Logging System for Node.js (Executable Project)

Centralized, structured logging for a Node.js service using **ELK** (Elasticsearch, Logstash, Kibana). This project solves a real-world problem: aggregating logs from services into a single place for troubleshooting, performance analysis, and auditing—with correlation IDs to trace a request across multiple components.

## What is ELK Stack?

ELK Stack is a popular open-source log management and analytics platform made up of three main tools:

### Elasticsearch (E)

- A powerful search and analytics engine.
- Stores logs in a structured way (JSON documents).
- Allows super-fast full-text search, filtering, aggregations, and dashboards.

### Logstash (L)

- A data processing pipeline tool.
- Collects logs from different sources (apps, servers, databases, APIs).
- Transforms and enriches them (e.g., parse fields, mask sensitive data).
- Ships logs to Elasticsearch (or other destinations).

### Kibana (K)

- A visualization and dashboard tool.
- Lets you explore and query logs stored in Elasticsearch.
- Build charts, graphs, and dashboards (e.g., error rates, request latency, top endpoints).

### 🔄 Together:

- Your app → Logstash → Elasticsearch → Kibana
- Logs flow from your application into Logstash, which processes and forwards them to Elasticsearch.
- Elasticsearch indexes the logs and makes them searchable.
- Kibana provides a UI to search, filter, and visualize them.

### ✅ Why use ELK Stack?

- Centralized logging (no need to log into each server).
- Easier debugging across microservices.
- Powerful search/filtering on structured logs.
- Real-time monitoring and dashboards.
- Helps detect errors, anomalies, and performance issues.

## Features

- **Structured JSON logs** using `pino`
- **Correlation IDs** per request (propagated via `x-correlation-id`)
- **User context** (`x-user-id`) captured in logs for auditing
- **HTTP Log shipping** to Logstash (no Beats agent required)
- **Error, crash, and latency** logging
- **ELK stack via Docker Compose** with a ready-to-use Logstash pipeline
- **Health check & demo endpoint** (`/health`, `/orders`)

---

## Quick Start

### 1) Prerequisites

- Docker + Docker Compose
- Node.js 20+ (only if you want to run app locally outside Docker)

### 2) Clone & Configure

```bash
git clone <this-repo> elk-logging-system-node
cd elk-logging-system-node
cp .env.example .env
```

### 3) Start the Stack

```bash
docker compose up -d --build
```

- Wait until Kibana is up (usually a minute after Elasticsearch is healthy).
- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601
- Logstash (HTTP input): http://localhost:8080
- App: http://localhost:3000

### 4) Send Some Traffic

Health:

```bash
curl -s http://localhost:3000/health
```

Create an order (success path):

```bash
curl -s -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: user_123' \
  -H 'x-correlation-id: c123' \
  -d '{"items":["book","pen","notebook"]}'
```

Create an order (expected error):

```bash
curl -s -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: user_456' \
  -d '{"items":[]}'
```

### 5) View Logs in Kibana

1. Open Kibana at http://localhost:5601
2. Go to Discover
3. If prompted, create a data view for index pattern: logs-node-\*
4. Add columns like: `msg`, `method`, url, statusCode, durationMs, correlationId, userId, service, environment

You’ll see:

- `request:start` / `request:finish` events for each call
- `order:created` on successful orders
- `order:error` with rich error details on failures
- `service:started` when the app booted

## Real-World Problem Solved

- Teams often struggle to debug issues across microservices: logs spread across containers and machines, different formats, missing context. This template centralizes everything into Elasticsearch with:
- Correlation IDs to follow a single request across services
- User IDs for audit trails
- Timing metrics (durationMs) to spot slowness
- Structured JSON so you can aggregate, filter, and visualize in Kibana

## Configuration

- App config: .env
- Logstash pipeline: logstash/pipeline/logstash.conf
- Elasticsearch: single-node, security disabled for local dev; enable security in prod

## Production Notes

- Enable Elasticsearch security & TLS
- Put Kibana behind auth / SSO
- Use a buffered/queued shipper (e.g., Filebeat, Vector, or a durable Pino transport) if Logstash may be unavailable
- Rotate indices with ILM, manage retention (e.g., keep 14–30 days)
- Create Kibana dashboards for latency, error rates, top endpoints

## Scripts

- npm start — start server
- npm run dev — same as start (dev env)
- In Docker Compose, the app starts automatically.

## Troubleshooting

- No logs in Kibana: Check Logstash container logs (docker logs logstash) and ensure index pattern logs-node-\* exists.
- Connection refused from app to Logstash: Verify LOGSTASH_URL matches http://logstash:8080 (service name from Compose).
- Kibana can’t connect: Ensure Elasticsearch is healthy (curl localhost:9200).

## Future Enhancements

- Resilient log shipping: add an on-disk buffer with retries (e.g., use Vector, or a Pino transport with backpressure + persistence).
- OpenTelemetry traces: emit trace/span IDs and integrate with Jaeger/Tempo for end-to-end tracing; link logs ↔ traces.
- PII scrubbing: add a filter to redact emails/phone numbers before shipping to Logstash.
- Index Lifecycle Management: enable ILM for hot/warm/cold tiers, rollovers, and retention.
- Dashboards: ship default Kibana dashboards (errors by route, p95 latency, top users, etc.).
- Alerting: add Watcher/ElastAlert/Alerting rules for spikes in 5xx or latency.
- Multiple services: run N services all pointing to the same Logstash, using service and environment fields to segment.
