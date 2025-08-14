const dotenv = require('dotenv');
dotenv.config();

function parseJSON(input, fallback) {
  try {
    if (!input) return fallback;
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'dev',
  memcachedServers: process.env.MEMCACHED_SERVERS || '127.0.0.1:11211',
  cacheDefaultTtl: Number(process.env.CACHE_DEFAULT_TTL || 60),
  cacheKeyPrefix: process.env.CACHE_KEY_PREFIX || 'app:',
  memcachedOptions: parseJSON(process.env.MEMCACHED_OPTIONS, {
    retries: 1,
    retry: 10000,
    remove: false,
    timeout: 5000
  })
};
