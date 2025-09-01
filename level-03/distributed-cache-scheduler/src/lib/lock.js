const IORedis = require('ioredis');
const Redlock = require('redlock');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = new IORedis(redisUrl);

const redlock = new Redlock([client], {
  // recommended driftFactor default, retry options:
  retryCount: 3,
  retryDelay: 200,
  retryJitter: 50
});

/**
 * Acquire lock on resource (string), returns lock object or null
 * ttl in ms
 */
async function acquire(resource, ttl = 10000) {
  try {
    const lock = await redlock.acquire([resource], ttl);
    return lock;
  } catch (err) {
    // couldn't acquire
    return null;
  }
}

async function release(lock) {
  try {
    await lock.release();
  } catch (err) {
    // ignore or log
    // console.error('release lock error', err);
  }
}

module.exports = { acquire, release, client };
