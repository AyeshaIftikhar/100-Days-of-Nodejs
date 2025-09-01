const IORedis = require('ioredis');
const logger = require('pino')();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = new IORedis(redisUrl);

/**
 * Set a key with optional ttl seconds
 */
async function set(key, value, ttlSeconds) {
  if (ttlSeconds) {
    await client.set(key, value, 'EX', Number(ttlSeconds));
  } else {
    await client.set(key, value);
  }
}

/**
 * Get key
 */
async function get(key) {
  return client.get(key);
}

/**
 * Delete
 */
async function del(key) {
  return client.del(key);
}

/**
 * Expose raw client for advanced ops
 */
module.exports = {
  client,
  set,
  get,
  del
};
