const Redis = require('redis');
const { REDIS_HOST, REDIS_PORT } = process.env;

class RedisConfig {
  constructor() {
    this.redisClient = Redis.createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redisClient.connect();
  }

  async getClient() {
    return this.redisClient;
  }
}

module.exports = new RedisConfig();