# Stock Price Fetcher

A Node.js application that fetches stock market data using the Alpha Vantage API.

## Features

- Get current stock price and details
- Get historical stock data
- Simple REST API interface
- Rate limiting handling
- Data validation

## Prerequisites

- Node.js (v14 or higher)
- Alpha Vantage API key (free tier available)

## API Endpoints
- GET /api/stock/:symbol - Get current stock data
Example: /api/stock/AAPL

- GET /api/stock/:symbol/history - Get historical stock data (default: 30 days)
Example: /api/stock/AAPL/history?days=50

- GET /health - Health check endpoint
