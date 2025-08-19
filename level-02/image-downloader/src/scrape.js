import * as cheerio from 'cheerio';

export async function scrapeImagesFromPage(pageUrl, { verbose = false, timeout = 20000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(pageUrl, {
      headers: { 'user-agent': 'imgdl-bot/1.0 (+https://example.org)' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const imgs = new Set();
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original');
      if (src) imgs.add(src.trim());
      const srcset = $(el).attr('srcset');
      if (srcset) {
        for (const part of srcset.split(',')) {
          const [u] = part.trim().split(' ');
          if (u) imgs.add(u.trim());
        }
      }
    });
    // Resolve to absolute URLs
    const abs = [];
    for (const u of imgs) {
      try {
        abs.push(new URL(u, pageUrl).href);
      } catch {/* ignore */}
    }
    if (verbose) console.log(`Scraped ${abs.length} images from ${pageUrl}`);
    return abs;
  } finally {
    clearTimeout(id);
  }
}
