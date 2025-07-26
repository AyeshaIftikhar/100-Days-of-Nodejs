const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  userAgent: process.env.USER_AGENT || 'MyScraper/1.0',
  defaultHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
  },
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Max requests per window
  },
};