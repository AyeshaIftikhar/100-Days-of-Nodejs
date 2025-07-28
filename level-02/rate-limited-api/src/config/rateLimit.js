const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  window: parseInt(process.env.RATE_LIMIT_WINDOW) || 60,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  byIp: process.env.RATE_LIMIT_BY_IP === 'true',
  byUser: process.env.RATE_LIMIT_BY_USER === 'true',
  byApiKey: process.env.RATE_LIMIT_BY_API_KEY === 'true',
  message: 'Too many requests, please try again later',
  statusCode: 429,
};