const store = new Map();

export function setCache(key, value, ttlMs) {
  const expires = Date.now() + (ttlMs || 0);
  store.set(key, { value, expires });
}

export function getCache(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expires && Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function delCache(key) {
  store.delete(key);
}

export function clearCache() {
  store.clear();
}
