// src/lib/cache.js
const cache = new Map();

function get(key) {
  return cache.get(key);
}

function set(key, value, ttl = 86400) {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttl * 1000);
}

function clear() {
  cache.clear();
}

module.exports = { get, set, clear };
