# Automated Screenshot Service (Puppeteer)

A production-ready API to capture **screenshots** and **PDFs** of web pages for monitoring, reports, archives, SEO thumbnails, and more.

## ✨ Features

- Fast screenshots (PNG/JPEG/WebP) and PDFs via Puppeteer
- Smart caching with TTL to avoid duplicate work
- Optional Bearer token auth
- Request validation (Zod)
- Rate limiting + security headers
- Health check + static file hosting for captured files
- Dockerized

## 🔧 Requirements

- Node.js 18+ (tested on Node 20)
- (Optional) Docker

## 🚀 Quick Start

```bash
git clone <this-repo> automated-screenshot-service
cd automated-screenshot-service
cp .env.example .env
npm ci
npm start
```

Service runs at: http://localhost:${PORT} (default 8080)

## Dev mode

```bash
npm run dev
```

## 🔐 Auth (optional)

Set AUTH_TOKEN in .env. Then pass Authorization: Bearer <token> to /api/\* routes.

### 📡 API

#### POST /api/screenshot

##### Body (JSON)

```json
{
  "url": "https://example.com",
  "width": 1366,
  "height": 768,
  "deviceScaleFactor": 1,
  "fullPage": true,
  "format": "png",
  "quality": 90,
  "delayMs": 500,
  "waitUntil": "networkidle0"
}
```

##### Response

```json
{
  "cached": false,
  "file": "/files/shot:abcd1234ef567890.png",
  "path": "/absolute/path/storage/outputs/shot:abcd1234ef567890.png"
}
```

#### POST /api/pdf

##### Body (JSON)

```json
{
  "url": "https://example.com",
  "format": "A4",
  "printBackground": true,
  "margin": {
    "top": "10mm",
    "right": "10mm",
    "bottom": "10mm",
    "left": "10mm"
  },
  "delayMs": 0,
  "waitUntil": "networkidle0"
}
```

##### Response

```json
{
  "cached": false,
  "file": "/files/pdf:abcd1234ef567890.pdf",
  "path": "/absolute/path/storage/outputs/pdf:abcd1234ef567890.pdf"
}
```

## Health Check

- GET /health → { ok: true, uptime, env }
- Accessing Files
- Files are served from /files/<filename>
- Directory configurable via OUTPUT_DIR


## 🐳 Docker
```bash
docker build -t screenshot-service .
docker run --rm -p 8080:8080 --env-file .env -v $(pwd)/storage/outputs:/app/storage/outputs screenshot-service
```

## 🧠 Tips

- Use delayMs for pages that render content after load (SPA).
- Use waitUntil: "networkidle0" to wait for network to settle.
- quality applies to jpeg/webp (ignored for PNG).

## 🛣️ Roadmap / Future Enhancements

- Queue + concurrency control (BullMQ + Redis) for high throughput
- Webhook callback when capture completes
- HTML-to-image for HTML snippets (no external URL)
- S3/GCS storage adapter
- Automatic mobile device emulation presets (iPhone/Android)
- Element screenshot via CSS selector
- Basic HTML dashboard for recent captures & status
- Cron-based scheduled captures & diffing for visual monitoring
