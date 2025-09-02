const fs = require('fs');
const path = require('path');
const parser = require('../utils/rssParser');
const cache = require('./cacheService');

// config
const FEEDS_CONFIG_PATH = path.join(__dirname, '..', 'config', 'feeds.json');
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);
const MAX_ITEMS = parseInt(process.env.MAX_FEED_ITEMS || '30', 10);

let feeds = [];
// load from config
function loadConfig() {
  try {
    const raw = fs.readFileSync(FEEDS_CONFIG_PATH, 'utf8');
    feeds = JSON.parse(raw);
  } catch (err) {
    console.warn('No feeds config found or invalid, starting with empty list.');
    feeds = [];
  }
}
loadConfig();

async function fetchFeed(feed) {
  const cacheKey = `feed:${feed.id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const parsed = await parser.parse(feed.url, { maxItems: MAX_ITEMS });
  // annotate items
  const items = (parsed.items || []).map((it, idx) => ({
    ...it,
    _feedId: feed.id,
    _feedTitle: feed.title,
    _encodedId: `${feed.id}__${idx}`
  }));
  cache.set(cacheKey, items, CACHE_TTL);
  return items;
}

async function getAggregatedFeeds() {
  // fetch all feeds in parallel but keep reasonable concurrency
  const promises = feeds.map(async (f) => {
    try {
      const items = await fetchFeed(f);
      return { feed: f, items };
    } catch (err) {
      console.error(`Failed to load ${f.id}:`, err.message || err);
      return { feed: f, items: [] };
    }
  });
  const results = await Promise.all(promises);
  // flatten and sort by date desc (if date available)
  const allItems = results.flatMap(r => r.items.map(it => ({ ...it })));
  allItems.sort((a, b) => {
    const da = new Date(a.pubDate || a.isoDate || a.pubdate || 0).getTime();
    const db = new Date(b.pubDate || b.isoDate || b.pubdate || 0).getTime();
    return db - da;
  });
  return allItems;
}

async function prefetchAll() {
  const promises = feeds.map(f => fetchFeed(f).catch(e => { console.error('prefetch err', e); return []; }));
  await Promise.all(promises);
}

async function getItemByEncodedId(encoded) {
  // encoded: feedId__index
  const [feedId, idxStr] = encoded.split('__');
  if (!feedId) return null;
  const feed = feeds.find(f => f.id === feedId);
  if (!feed) return null;
  const items = await fetchFeed(feed);
  const idx = parseInt(idxStr, 10);
  return items[idx] || null;
}

async function addFeed(feedObj) {
  // append to feeds array and save config
  feeds.push(feedObj);
  fs.writeFileSync(FEEDS_CONFIG_PATH, JSON.stringify(feeds, null, 2), 'utf8');
  // fetch immediately
  await fetchFeed(feedObj);
}

module.exports = {
  getAggregatedFeeds,
  prefetchAll,
  getItemByEncodedId,
  addFeed,
  loadConfig
};
