const redisClient = require("../config/redis");
const { promisify } = require("util");

// Promisify Redis methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

class RedisService {
  constructor() {
    this.ttl = process.env.REDIS_TTL || 3600;
    this.client = redisClient;
  }

  async get(key) {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const data = await getAsync(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(key, value) {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await setAsync(key, JSON.stringify(value), "EX", this.ttl);
      return true;
    } catch (error) {
      console.error("Redis set error:", error);
      return false;
    }
  }

  async delete(key) {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await delAsync(key);
      return true;
    } catch (error) {
      console.error("Redis delete error:", error);
      return false;
    }
  }

  async clearCacheByPattern(pattern) {
    try {
      const keys = await new Promise((resolve, reject) => {
        redisClient.keys(pattern, (err, keys) => {
          if (err) reject(err);
          resolve(keys);
        });
      });

      if (keys.length > 0) {
        await delAsync(keys);
      }
      return true;
    } catch (error) {
      console.error("Redis clear cache error:", error);
      return false;
    }
  }
}

module.exports = RedisService;
