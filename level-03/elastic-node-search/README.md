# elastic-node-search

Goal / real-world problem solved: Provide a simple, production-extendable Node.js microservice that lets you index documents into Elasticsearch, perform CRUD on documents, and run full-text searches — useful for adding search to apps (catalogs, blogs, docs, logs, customer support search, etc.).

Simple Node.js microservice demonstrating Elasticsearch integration:

- index documents
- CRUD operations by id
- full-text search with pagination and tag filtering

### Features

- Uses official `@elastic/elasticsearch` Node.js client.
- Docker Compose file to run Elasticsearch 9.x + Kibana locally.
- Endpoints:
  - `POST /documents` — create & index a document
  - `GET /documents/:id` — fetch document
  - `PUT /documents/:id` — update document
  - `DELETE /documents/:id` — delete document
  - `POST /documents/search` — search documents

## Quickstart (local)

### prerequisites

- Docker & Docker Compose
- Node.js (v16+)
- npm

### 1) Start Elasticsearch + Kibana with Docker

```bash
docker-compose up -d
```

Kibana will be available at http://localhost:5601
and Elasticsearch at http://localhost:9200
.

### 2) Install server deps

```bash
cp .env.example .env
# edit .env if needed
npm install
```

### 3) Run the service

```bash
npm run start
# or in dev mode
npm run dev
```

#### Example usage (curl)

##### Create a document:

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"First doc","body":"Hello Elastic","tags":["guide","intro"]}'
```

##### Search:

```bash
curl -X POST http://localhost:3000/documents/search \
  -H "Content-Type: application/json" \
  -d '{"q":"Hello","page":1,"size":10}'
```

##### Get by id:

```bash
curl http://localhost:3000/documents/<id>
```

## Notes & troubleshooting

- If Elasticsearch runs with authentication, supply ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWORD in .env.
- Adjust the Docker image tag in docker-compose.yml to change ES version.
- Official client docs: https://www.elastic.co/guide/en/elasticsearch/client/javascript/current/

## Future enhancements

- Add request validation and stricter mapping for document types.
- Add bulk indexing endpoint for importing large datasets.
- Secure the service (JWT auth, rate limiting).
- Add telemetry & monitoring (Prometheus, APM).
- Support multi-index and alias patterns for blue-green reindexing.
- Add unit/integration tests and CI pipeline.
