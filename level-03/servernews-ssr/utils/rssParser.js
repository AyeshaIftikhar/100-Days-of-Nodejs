const fetch = require('node-fetch');
const xml2js = require('xml2js');
const sanitizeHtml = require('sanitize-html');

const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

async function fetchXML(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'ServerNews-SSR/1.0' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  const text = await res.text();
  return text;
}

function normalizeItem(item) {
  // Attempt to normalize RSS/Atom fields into a common shape
  const title = item.title && (typeof item.title === 'object' ? item.title._ : item.title) || 'Untitled';
  const link = item.link && (typeof item.link === 'object' ? (item.link.href || item.link._) : item.link) || item.guid || null;
  let description = item.description || item.summary || item.content || item['content:encoded'] || '';
  if (typeof description === 'object') description = description._ || '';
  description = sanitizeHtml(description, { allowedTags: ['b','i','a','p','ul','li','strong','em','br'], allowedAttributes: { a: ['href','rel','target'] }});
  const pubDate = item.pubDate || item.published || item.updated || item['dc:date'] || null;
  return {
    title: String(title),
    link: link ? String(link) : null,
    description: description || '',
    pubDate: pubDate ? new Date(pubDate).toISOString() : null
  };
}

async function parse(url, opts = {}) {
  const xml = await fetchXML(url);
  const result = await parser.parseStringPromise(xml);
  // detect feed type
  let items = [];
  try {
    if (result.rss) {
      // RSS
      const channel = result.rss.channel;
      items = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];
    } else if (result.feed && result.feed.entry) {
      // Atom
      items = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
    } else {
      // try common path
      items = result.item ? (Array.isArray(result.item) ? result.item : [result.item]) : [];
    }
  } catch (e) {
    items = [];
  }
  const max = opts.maxItems || 30;
  items = items.slice(0, max).map(normalizeItem);
  return { items };
}

module.exports = { parse };
