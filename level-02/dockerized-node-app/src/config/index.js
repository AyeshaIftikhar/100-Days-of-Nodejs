require('dotenv').config();

module.exports = {
  app: {
    name: process.env.APP_NAME || 'StockPriceFetcher',
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    baseUrl: process.env.ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co/query'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  }
};