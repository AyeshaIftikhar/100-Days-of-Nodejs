const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  fetchInterval: parseInt(process.env.FETCH_INTERVAL) || 30,
  maxFeedsPerUser: parseInt(process.env.MAX_FEEDS_PER_USER) || 50,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000,
  userAgent: process.env.USER_AGENT || 'RSS-Reader/1.0',
  defaultLimit: 20,
  maxDescriptionLength: 500,
};