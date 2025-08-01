# Dockerized Stock Price Fetcher

A complete Node.js application for fetching stock market data using Alpha Vantage API, with Docker support.

## Features

- REST API for stock price data
- Redis caching for improved performance
- Rate limiting
- Comprehensive logging
- Health checks
- Docker and Docker Compose support
- Development and production configurations

## Prerequisites

- Docker and Docker Compose installed
- Alpha Vantage API key (free tier available)

## Quick Start

1. Clone the repository
2. Create `.env` file based on `.env.example`
3. Run the application:

```bash
docker-compose up --build
```

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## API Endpoints

- GET /api/stocks/:symbol - Get current stock data
- GET /api/stocks/:symbol/history - Get historical data (default: 30 days)
- GET /health - Health check endpoint

## Development

- Running tests

```bash
docker-compose exec app npm test
```

- Linting

```bash
docker-compose exec app npm run lint
```

## Deployment

- Production Build

```bash
docker-compose -f docker-compose.yml up --build -d
```
