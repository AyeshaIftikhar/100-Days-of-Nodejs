# SSR (Server-Side Rendering)

Server-Side Rendering means generating the HTML of a web page on the server, instead of sending just an empty HTML shell to the browser and letting JavaScript build everything.

## How it works (step by step)

- `Request` → User visits example.com/news.
- `Server` → The Node.js server fetches data (e.g., news feed), renders it into HTML using a template engine (like EJS, Pug, or a framework like Next.js).
- `Response` → The server sends back fully rendered HTML to the browser.
- `Browser` → Immediately displays the page content without waiting for JavaScript to build the UI.

## Why is SSR useful?

-  `Faster first load` – The user sees content immediately, instead of waiting for JS to download/execute.
-  `Better SEO` – Search engines (Google, Bing, etc.) can crawl HTML easily. Client-side rendered apps (SPA) sometimes hide content behind JavaScript.
-  `Improved performance on low-power devices` – Rendering happens on the server, so the user’s phone/browser has less work.
-  `Social media previews` – Links shared on Twitter/Facebook/LinkedIn show the correct preview because HTML already contains metadata.

## Comparison

- __CSR (Client-Side Rendering):__ Server sends a blank page + JS bundle → Browser builds UI. (e.g., React SPA)
- __SSR (Server-Side Rendering):__ Server sends a fully rendered page + optional JS for interactivity.
- __SSG (Static Site Generation):__ Pages are pre-built at build time, served as static HTML.

## Real-world examples of SSR:

- News websites (NYTimes, BBC, CNN) – need SEO-friendly, fast-loading pages.
- E-commerce (Amazon, eBay) – product pages must load instantly for conversions.
- Blogs/Documentation – Google indexing works best with HTML served from the server.

## ServerNews SSR

ServerNews SSR is a simple Server-Side Rendered (SSR) Node.js app that aggregates RSS/Atom feeds and renders them server-side using EJS. It's SEO-friendly, fast, and suitable for building a niche news or events aggregator.

## Features

- Fetches and parses RSS/Atom feeds.
- Server-side rendering with EJS for SEO.
- Simple in-memory caching with TTL.
- JSON API endpoints for aggregated feeds and single items.
- Lightweight admin endpoint to add new feeds (demo).
- Easy to extend and deploy.

## Requirements

- Node.js 18+ (Node 18 recommended)
- npm

## Quickstart

```bash
git clone <this-repo>
cd servernews-ssr
npm install
cp .env.example .env
# edit .env if needed
npm run dev
```

Open http://localhost:3000.

## Configuration

- `config/feeds.json` — list of feed descriptors (id, title, url).
- `.env` — environment variables:
  - `PORT` — port to run the server (default 3000)
  - `CACHE_TTL_SECONDS` — feed cache TTL in seconds
  - `MAX_FEED_ITEMS` — max items to fetch per feed

## API

- `GET /api/feeds` — JSON of aggregated items.
- `GET /api/item/:encoded` — single item by encoded id (format feedId\_\_index).
- `GET /health` — health check endpoint.

## How the SSR works

- The app fetches and parses RSS/Atom feeds on the server using node-fetch + xml2js.
- Items are sanitized and cached for CACHE_TTL_SECONDS.
- EJS templates render the list and article pages server-side, which is good for SEO and quick first paint.

## Notes

- This demo uses an in-memory cache and filesystem-backed config/feeds.json. For production, use Redis or another store and a proper admin interface with authentication.
- Respect robots.txt and copyright of feeds. Only collect public feeds.

## Future enhancements

1. **Persistent DB & Admin UI**

   - Replace in-memory & file-based feed config with a database (Postgres, MongoDB).
   - Add admin UI with authentication (OAuth or JWT) to manage feeds, categories, and scheduled fetch settings.

2. **Distributed caching**

   - Use Redis for cache to scale across multiple server instances.

3. **Scheduled background worker**

   - Move feed fetching to a worker (BullMQ / agenda / cron) to avoid blocking requests and enable retries.

4. **Rate limiting & backoff**

   - Respect feed server limits with per-feed rate-limiting and exponential backoff on failures.

5. **Source attribution & scraping**

   - Extract images & canonical URLs more reliably. Provide richer meta (author, read-time).

6. **Pagination & filtering**

   - Add pagination, search, and tag/category filters to enhance UX.

7. **Sitemap & SEO**

   - Auto-generate sitemap.xml and RSS of aggregated site for search engine indexing.

8. **Server-side rendering with React**

   - Upgrade to React SSR (Next.js or custom React SSR) if interactivity and client-side hydration needed.

9. **Testing**

   - Add unit and integration tests (Jest, Supertest).

10. **Docker & CI**
    - Provide Dockerfile, docker-compose, and CI pipeline for automated tests & deployment.

# Notes & Security

- This repository uses `sanitize-html` to sanitize returned descriptions. Still be cautious with user-provided content.
- When deploying publicly, do not use the simple admin form in production without authentication.
- Respect copyright and robots rules for feeds.
