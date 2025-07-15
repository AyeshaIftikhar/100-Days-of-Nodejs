# Simple Web Scrapper

`simple-web-scraper` is a lightweight Node.js tool that fetches and parses HTML from websites using Axios and Cheerio to extract specific content like article titles, links, or metadata. Cheerio allows you to use jQuery-like syntax to work with server-side HTML DOM(Document Object Model).

## Features

- Fetch any webpage via URL
- Parse and extract HTML elements (e.g., titles, links, images)
- Simple CLI or API usage
- Easily extendable for more complex scraping
- No headless browser needed (fast & light)

## Endpoint

```curl
GET http://localhost:3000/api/scrape?url=https://example.com
```

Response

```json
{
  "count": 3,
  "results": [
    {
      "title": "Getting Started",
      "link": "/getting-started"
    },
    {
      "title": "Contact Us",
      "link": "/contact"
    }
  ]
}
```

## 🚀 Future Enhancements

| Feature                         | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| 🔎 CSS Selector via query param | Allow dynamic selectors: `?selector=h1`         |
| 💾 CSV/JSON Export              | Option to download results                      |
| ⏱️ Schedule scraping            | Use `node-cron` for periodic scraping           |
| 🛑 Error handling enhancements  | Handle redirects, retries, 403 blocks           |
| 🛡️ Rate limiting + proxy use    | Avoid getting blocked                           |
| 🌐 CORS / API Key security      | Secure public access                            |
| 🧠 Smart scraper with patterns  | Identify patterns (e.g., blog posts)            |
| 📸 Puppeteer fallback           | Use headless browser for JavaScript-heavy sites |
