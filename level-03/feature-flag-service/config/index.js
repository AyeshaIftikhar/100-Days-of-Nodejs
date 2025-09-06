const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/feature-flags',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_this',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // limit each IP to 100 requests per windowMs
  },
};
