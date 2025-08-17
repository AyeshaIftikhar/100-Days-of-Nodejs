# MDCraft — Markdown Blog Engine (Niche-Optimized)

MDCraft is a production-ready, SEO-first Markdown blog engine designed for **high-paying tech niches**:
**AI Engineering, Cloud Cost Optimization (FinOps), Cybersecurity, and FinTech Compliance**.

## Why MDCraft?

- 🚀 Fast publishing (Markdown + frontmatter)
- 🧭 SEO built-in (sitemap, RSS, canonical, Open Graph, JSON-LD)
- 💼 Niche-ready CTAs for consulting/audits/workshops
- 🔎 Search powered by Lunr
- 🛡️ Secure defaults (helmet, rate limiting), optimized (compression)
- 🐳 Dockerized

## Authoring

Create posts in content/posts/ with frontmatter:

```
title: Post Title
date: 2025-08-17
category: ai
tags: [evals, rag]
niche: ai-engineering
```

## Scripts

- npm run dev – dev server with nodemon
- npm start – production server
- npm run build:sitemap – generate public/sitemap.xml

## Deploy

Deploy on Docker

```bash
docker build -t mdcraft .
docker run -p 3000:3000 --env-file .env mdcraft
```

## Content Authoring Guide

Create a new post in `content/posts/`:

```bash
---
title: Your Post Title
date: 2025-08-17
category: ai
tags: [evals, rag, mlops]
niche: ai-engineering
ogImage: /public/og/your-image.png
slug: optional-custom-slug
---

Your Markdown content with code blocks, images in /public, etc.
```

The filename convention `YYYY-MM-DD-title.md` helps chronological sorting.

## Minimal API Endpoints

- `GET /` — homepage
- `GET /post/:slug` — post page
- `GET /category/:name` — category landing
- `GET /tag/:name` — tag landing
- `GET /search?q=...` — full-text search via Lunr
- `GET /rss.xml` — RSS feed
- `GET /health` — health check

## Structure

- `content/` – markdown posts & pages
- `public/` – static assets (CSS/JS/images)
- `src/` – express app, views (EJS), services, SEO middleware

## Roadmap / Future Enhancements

- Static export mode (generate HTML files for CDN hosting)
- Admin UI for content editing (local Git or headless CMS adapter)
- Image optimization pipeline (thumbs, lazy loading, WebP)
- TOC generator & anchor sidebar
- Multilingual support (i18n routing)
- Newsletter integration (ConvertKit/Mailchimp)
- Webhooks to rebuild search index on commit
- Tag/Category analytics dashboards
- Per-post A/B testing for CTAs
- Comments via privacy-friendly provider
- Search suggestions & typo tolerance
