const dotenv = require('dotenv');
dotenv.config();

const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_KEY: process.env.API_KEY || 'change-me',
  HISTORY_LIMIT: parseInt(process.env.HISTORY_LIMIT || '100', 10),
  HEARTBEAT_MS: parseInt(process.env.HEARTBEAT_MS || '25000', 10)
};

module.exports = config;
