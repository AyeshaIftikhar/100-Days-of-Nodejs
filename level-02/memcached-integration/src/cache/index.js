const Memcached = require('memcached');
const {
  memcachedServers,
  memcachedOptions,
  cacheKeyPrefix
} = require('../config');

const client = new Memcached(memcachedServers.split(','), memcachedOptions);

// Helper to namespace keys
const withPrefix = (key) => `${cacheKeyPrefix}${key}`;

// Promisified wrappers
function get(key) {
  return new Promise((resolve, reject) => {
    client.get(withPrefix(key), (err, data) => {
      if (err) return reject(err);
      if (data == null) return resolve(null);
      // Attempt to parse JSON; fallback to string
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch {
        resolve(data);
      }
    });
  });
}

function set(key, value, ttlSeconds) {
  return new Promise((resolve, reject) => {
    const toStore =
      typeof value === 'string' ? value : JSON.stringify(value);
    client.set(withPrefix(key), toStore, Number(ttlSeconds), (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function del(key) {
  return new Promise((resolve, reject) => {
    client.del(withPrefix(key), (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function flush() {
  return new Promise((resolve, reject) => {
    client.flush((err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function shutdown() {
  client.end();
}

module.exports = {
  get,
  set,
  del,
  flush,
  shutdown
};
