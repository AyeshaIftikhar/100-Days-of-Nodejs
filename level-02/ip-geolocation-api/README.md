# IP Geolocation API (IP lookup)

A small, extensible Node.js + Express service to look up geolocation information for IP addresses.

## Features

- Lookup by client IP (`/api/me`) or query param (`/api/geo?ip=1.2.3.4`)
- Uses `ip-api.com` by default (no API key required for basic usage)
- Caching (in-memory via `node-cache`)
- Rate limiting (via `express-rate-limit`)
- Dockerfile + docker-compose
- Tests with Jest & Supertest

### Run using docker

```
docker build -t ip-geolocation-api .
docker run -p 3000:3000 --env-file .env ip-geolocation-api
```

## Endpoints

- GET / — basic info
- GET /api/geo?ip=<ip> — lookup a supplied IP (if absent, uses request IP)
- GET /api/me — lookup the origin IP of the request

```bash
curl 'http://localhost:3000/api/geo?ip=8.8.8.8'
curl 'http://localhost:3000/api/me'
```

## Supported Providers

- Default provider: ip-api (http://ip-api.com) — no key required, but has rate limits and usage policy.
- You can add new providers inside src/services/geoService.js and select by setting GEODB_PROVIDER in .env.

## Security & Rate Limits

- We use basic rate limiting. If you expose this publicly, consider stronger protections (IP-based per-user key, auth).
- Consider using a paid provider (ipinfo, ipstack, ipdata) if you need higher quota and SLA.
