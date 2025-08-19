import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { lookup as mimeLookup, extension as mimeExt } from 'mime-types';
import * as pLimitModule from 'p-limit';
const pLimit = pLimitModule.default;
import * as sanitizeModule from 'sanitize-filename';
const sanitize = sanitizeModule.default;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function urlToSafeBaseName(url, prefix) {
  const u = new URL(url);
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);
  const base = sanitize(path.basename(u.pathname)) || 'image';
  const stem = base.replace(/\.[^.]+$/, '');
  return (prefix ? `${prefix}-` : '') + `${stem}-${hash}`;
}

async function fetchWithRetry(url, { retries = 3, timeout = 20000, backoff = 400 }) {
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'imgdl-bot/1.0 (+https://example.org)' },
        signal: controller.signal,
      });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(id);
    }
    attempt++;
    if (attempt <= retries) {
      await sleep(backoff * Math.pow(2, attempt - 1));
    }
  }
  throw lastErr;
}

async function streamToFile(readable, filePath) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  const fileStream = fs.createWriteStream(filePath);
  return new Promise((resolve, reject) => {
    readable.body.pipe(fileStream);
    readable.body.on('error', reject);
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
}

function deduceExtension(url, contentType) {
  // Prefer content-type
  if (contentType) {
    const ext = mimeExt(contentType);
    if (ext) return '.' + ext;
  }
  // Fallback to URL extension if present
  const m = /\.([a-zA-Z0-9]{2,5})(?:[?#].*)?$/.exec(new URL(url).pathname);
  if (m) return '.' + m[1].toLowerCase();
  // Default
  return '.img';
}

export async function downloadOne(url, { out, retries, timeout, prefix, force, dryRun, quiet, verbose }) {
  try {
    const head = await fetchWithRetry(url, { retries, timeout });
    const type = head.headers.get('content-type') || undefined;
    const ext = deduceExtension(url, type);
    const baseName = urlToSafeBaseName(url, prefix) + ext;
    const filePath = path.join(out, baseName);

    if (fs.existsSync(filePath) && !force) {
      if (!quiet) console.log(`Skipped (exists): ${filePath}`);
      return { url, status: 'skipped', filePath };
    }

    if (dryRun) {
      console.log(`[dry-run] Would save: ${filePath}`);
      return { url, status: 'dry-run', filePath };
    }

    // If HEAD-like request wasn't already the body, re-fetch for body
    // We used GET already to support servers that disallow HEAD.
    // So we can reuse the same response stream by re-downloading to get a fresh readable stream.
    const res = await fetchWithRetry(url, { retries, timeout });
    if (!res.ok || !res.body) throw new Error(`Failed to download: ${res.status} ${res.statusText}`);

    await streamToFile(res, filePath);
    if (!quiet) console.log(`Saved: ${filePath}`);
    return { url, status: 'saved', filePath };
  } catch (err) {
    if (!quiet) console.error(`Error: ${url} -> ${err.message}`);
    return { url, status: 'error', error: err.message };
  }
}

export async function downloadMany(urls, opts) {
  const limit = pLimit(Math.max(1, Number(opts.concurrency || 5)));
  const tasks = urls.map(u => limit(() => downloadOne(u, opts)));
  const results = await Promise.all(tasks);
  const summary = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  if (!opts.quiet) {
    console.log('--- Summary ---');
    console.log(summary);
  }
  return results;
}
