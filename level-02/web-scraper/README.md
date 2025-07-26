# Web Scraper with Storage (Cheerio + DB)

A robust web scraping solution that extracts data and stores it in MongoDB.

## Features

- **Multiple Scraper Types**: E-commerce, news, and generic scrapers
- **Scheduled Scraping**: Regular automatic scraping
- **Data Storage**: MongoDB integration
- **Error Handling**: Comprehensive logging and retries
- **API Endpoints**: Manage jobs and view scraped data
- **Proxy Support**: Rotating proxies to avoid bans
- **User-Agent Rotation**: Mimic different browsers

## API Endpoints

### Scrape Jobs
- `POST /jobs` - Create a new scrape job
- `GET /jobs` - List all jobs
- `POST /jobs/:id/run` - Execute a job immediately

### Scraped Data
- `GET /jobs/:id/data` - Get scraped data for a job

## Job Configuration

```json
{
  "name": "Amazon Product Tracker",
  "url": "https://www.amazon.com/dp/B08N5KWB9H",
  "type": "ecommerce",
  "selectors": {
    "title": "h1#title",
    "price": "span.a-price-whole",
    "image": "img#landingImage"
  },
  "schedule": "0 * * * *" // Every hour
}


```bash
npm install axios cheerio mongoose dotenv node-cron puppeteer
npm install --save-dev nodemon
```