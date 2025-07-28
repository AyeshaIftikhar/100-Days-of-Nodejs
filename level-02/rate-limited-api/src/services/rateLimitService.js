const redisClient = require('../config/redis');
const rateLimitConfig = require('../config/rateLimit');
const logger = require('../utils/logger');

class RateLimitService {
  constructor() {
    this.redis = redisClient;
    this.window = rateLimitConfig.window;
    this.max = rateLimitConfig.max;
  }

  async checkRateLimit(key) {
    try {
      const current = await this._getCurrentCount(key);
      const isOverLimit = current >= this.max;

      if (isOverLimit) {
        const ttl = await this._getKeyTtl(key);
        return {
          allowed: false,
          remaining: 0,
          reset: Math.ceil(ttl),
        };
      }

      await this._incrementCount(key);
      return {
        allowed: true,
        remaining: this.max - current - 1,
        reset: this.window,
      };
    } catch (error) {
      logger.error(`Rate limit error for key ${key}: ${error.message}`);
      // Fail open in case of Redis failure
      return {
        allowed: true,
        remaining: this.max,
        reset: this.window,
      };
    }
  }

  async _getCurrentCount(key) {
    return new Promise((resolve, reject) => {
      this.redis.get(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply ? parseInt(reply) : 0);
      });
    });
  }

  async _incrementCount(key) {
    return new Promise((resolve, reject) => {
      this.redis.multi()
        .incr(key)
        .expire(key, this.window)
        .exec((err) => {
          if (err) reject(err);
          resolve();
        });
    });
  }

  async _getKeyTtl(key) {
    return new Promise((resolve, reject) => {
      this.redis.ttl(key, (err, ttl) => {
        if (err) reject(err);
        resolve(ttl);
      });
    });
  }
}

module.exports = new RateLimitService();