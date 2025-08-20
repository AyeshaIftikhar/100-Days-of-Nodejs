# ProxyPulse (URL + VPN Checker)

A real-world, production-ready Node.js tool to:

- ✅ Check URL reachability & latency (with DNS diagnostics and optional proxy testing)
- 🛡️ Detect if your current network is **likely** using a VPN or hosting proxy (heuristics + IP intelligence)
- 🚀 Use via **CLI** or **HTTP API**

> Built for DevOps, QA, and network troubleshooting—use it locally, in CI, or inside containers.

---

## ✨ Features

- **URL Checker**
  - DNS resolve (A/AAAA), HTTP status, redirects, headers, content-length
  - Latency measurement and timeout handling
  - Optional outbound proxy via `HTTP_PROXY` / `HTTPS_PROXY`
- **VPN/Proxy Detector**
  - Finds your public IP via multiple providers
  - Enriches with org/ASN using `ipinfo.io` and `ipapi.co` (no keys)
  - Heuristic verdict using keywords for common VPNs/hosting (configurable)
- **Interfaces**
  - **CLI** (`proxypulse check-url …`, `proxypulse check-vpn`)
  - **API** (`POST /api/check-url`, `GET /api/check-vpn`)
- **Configurable**
  - `config/default.json` for timeouts, heuristics, and IP providers
  - `.env` for proxy and port overrides

---


## 🛠️ Installation

**Prereqs:** Node.js 18.17+

```bash
# 1) Unzip or clone, then cd
cd ProxyPulse

# 2) Install deps
npm i

# 3) (Optional) configure env
cp .env.example .env
# edit HTTP_PROXY / HTTPS_PROXY etc.
```

---

## ▶️ Usage (CLI)

### Check a URL

```bash
npx proxypulse check-url https://example.com
# or if installed locally in this folder:
npm run cli -- check-url https://example.com
```

Optional arguments:

```bash
proxypulse check-url https://example.com -X POST -t 15000
```

### Check if you're on VPN/Proxy

```bash
npx proxypulse check-vpn
# or
npm run cli -- check-vpn
```

### Use a Proxy for URL checks

Set environment variables (system-wide or in `.env`):

```bash
export HTTPS_PROXY="http://user:pass@host:port"
export HTTP_PROXY="http://user:pass@host:port"
proxypulse check-url https://example.com
```

---

## 🌐 Usage (HTTP API)

Start the server:

```bash
npm start
# default: http://localhost:6060
```

Endpoints:

- `POST /api/check-url`
  ```json
  {
    "url": "https://example.com",
    "method": "GET"
  }
  ```
- `GET /api/check-vpn`

Example:

```bash
curl -s http://localhost:6060/api/check-vpn | jq
curl -s -X POST http://localhost:6060/api/check-url -H 'content-type: application/json' -d '{"url":"https://example.com"}' | jq
```

---

## 🧪 Real-World Scenarios This Solves

- **QA & Uptime**: Verify an app is up from a CI runner or from behind a corporate proxy.
- **Troubleshooting**: Is a region/CDN or DNS issue causing failures?
- **Compliance**: Ensure traffic egresses from allowed networks (no unexpected VPN/proxy).
- **Support**: Share a one-line command to collect evidence from users.

---

## ⚙️ Configuration

Edit `config/default.json`:

- `requestTimeout`: HTTP timeout in ms
- `userAgent`: UA header for outbound requests
- `vpnHeuristics`: keyword arrays that influence the VPN/Proxy decision
- `ipApis`: list of IP providers; the first to respond is used

Override with `.env`:

- `REQUEST_TIMEOUT`
- `PORT`
- `HTTP_PROXY` / `HTTPS_PROXY`

---

## 🧠 How the VPN/Proxy Verdict Works

1. Discover public IP via multiple services (`ipify`, `ipinfo`, `ipapi`).
2. Enrich metadata (org/ASN).
3. Apply heuristics:
   - If org/ASN matches known hosting or VPN keywords ⇒ **likely** VPN/proxy.
   - Otherwise ⇒ **unlikely**.

> Note: This is a best-effort heuristic. For strict needs, integrate paid IP intelligence APIs.

---

## 🐳 (Optional) Docker

```dockerfile
# Dockerfile (example)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 6060
CMD ["npm","start"]
```

Build & run:

```bash
docker build -t proxypulse .
docker run --rm -p 6060:6060 --env-file .env proxypulse
```

---

## 🔒 Notes on Privacy & Limits

- Outbound requests hit the configured IP providers and any URL you check.
- No API keys are required; responses may vary by provider availability.
- Heuristic verdicts can be tuned via config.

---

## 🗺️ Roadmap / Future Enhancements

- Multi-region checks via workers (e.g., run from multiple cloud regions).
- Scheduled monitors with alerting (email/Slack/Webhook) and history.
- DNS-over-HTTPS and custom resolvers per check.
- TLS certificate chain and expiry diagnostics.
- Content assertions (e.g., must contain a string/regex).
- Pluggable IP intelligence providers with API keys and caching.
- HTML report generation for sharing results.

---

## 🧾 License

MIT
