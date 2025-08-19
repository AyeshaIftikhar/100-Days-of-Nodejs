import fs from 'node:fs';
import path from 'node:path';
import { parse as csvParse } from 'csv-parse/sync';

export async function parseInputFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buf = fs.readFileSync(filePath);
  if (ext === '.txt') {
    return buf.toString('utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  if (ext === '.csv') {
    const rows = csvParse(buf, { columns: true, skip_empty_lines: true });
    const urls = [];
    for (const row of rows) {
      const key = Object.keys(row).find(k => k.toLowerCase() === 'url');
      if (key && row[key]) urls.push(String(row[key]).trim());
    }
    return urls;
  }
  if (ext === '.json') {
    const data = JSON.parse(buf.toString('utf8'));
    if (Array.isArray(data)) return data.map(String);
    if (Array.isArray(data.urls)) return data.urls.map(String);
    throw new Error('JSON must be an array of URLs or { "urls": [...] }');
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

export function normalizeUrlList(list) {
  const set = new Set();
  for (const u of list) {
    if (!u) continue;
    try {
      const url = new URL(u, 'http://dummy.invalid');
      // If it's protocol-relative or path-only, ignore; scraping handles relative URLs
      if (!/^https?:$/i.test(url.protocol)) {
        set.add(String(u).trim());
      } else {
        set.add(url.href);
      }
    } catch {
      // keep raw; may still be valid or handled by scraper
      set.add(String(u).trim());
    }
  }
  return Array.from(set).filter(u => /^https?:\/\//i.test(u));
}
