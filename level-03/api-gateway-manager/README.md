# API Gateway Manager

A minimal Node.js service to programmatically manage API gateway entities (Kong). Also includes a scaffold to support Tyk. This tool helps automate service on-boarding: create services, create routes, list services, and delete services via a REST API.

## Features

- Register service + routes in Kong via Kong Admin API.
- List and delete services.
- Sample upstream microservice for testing.
- Tyk client scaffold (extendable).
- Docker Compose to run Kong & a sample upstream.

## Requirements

- Node.js >= 16
- npm
- Docker & Docker Compose (for running Kong locally)

## Getting started

1. Clone or copy the repo.
2. `cp .env.example .env` and edit if needed.
3. `npm install`
4. Start Kong and sample upstream (recommended): `docker compose up --build -d`
5. Start the manager: `npm start` (or `npm run dev`)

## Quick example

Register service:

```bash
curl -X POST http://localhost:4000/kong/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sample-service",
    "upstream_url": "http://host.docker.internal:5000",
    "routes": [
      { "name": "sample-route", "paths": ["/sample"], "methods": ["GET"] }
    ]
  }'
```

# Future Enhancements (short list)

1. **Full Tyk integration**: implement complete Tyk Dashboard flows (API creation, policies, keys) and adapt to Tyk licensing & deployment modes.
2. **Authentication & RBAC**: protect the Manager API with JWT / OAuth + RBAC for team-level permissions.
3. **Multi-Gateway support**: add pluggable drivers for different gateways (Kong, Tyk, Ambassador, Traefik, Istio Gateway) with a common interface.
4. **Service discovery integration**: connect to Consul / etcd / Kubernetes to auto-register services discovered in the cluster.
5. **CI/CD hooks**: GitHub / GitLab webhooks to auto-register services when new microservices are deployed.
6. **Validation & policy engine**: validate route rules, apply rate-limiting and security policies automatically using templates.
7. **UI Dashboard**: simple React UI to list services and perform on-boarding.
8. **Automated tests & integration tests**: add tests that spin up Kong in CI and assert admin API actions.
9. **Observability**: integrate with Prometheus / Grafana and log correlation for requests proxied through gateways.
10. **Kubernetes Operator**: implement a Kubernetes operator to reconcile custom resources into Gateway config (for k8s-native workflows).

# Notes & Limitations

- This repository focuses on **Kong** and provides a working client against Kong Admin API. Tyk support is a scaffold — Tyk's deployment modes and Dashboard API vary, so you'll typically need to adapt the `tykClient` to your environment.
- Networking between Docker containers vs host can cause unreachable upstreams. Use the proper hostnames depending on your environment.
- Kong image tag `kong:3.3` used in docker-compose is a placeholder; you may choose a different version.
