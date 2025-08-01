const redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = new redis({
      host: config.redis.host,
      port: config.redis.port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        logger.warn('Redis connection refused - running without cache');
        this.client = {
          get: () => Promise.resolve(null),
          set: () => Promise.resolve('OK'),
          del: () => Promise.resolve(0),
          on: () => this.client
        };
      } else {
        logger.error(`Redis error: ${err}`);
      }
    });
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error(`Cache set error: ${error.message}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error: ${error.message}`);
    }
  }
}

module.exports = new CacheService();