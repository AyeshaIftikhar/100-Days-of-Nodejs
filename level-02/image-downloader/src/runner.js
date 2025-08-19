import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseInputFile, normalizeUrlList } from './sources.js';
import { scrapeImagesFromPage } from './scrape.js';
import { downloadMany } from './tasks.js';

export async function run(options) {
  const {
    input, scrape, urls = [], out, concurrency, retries, timeout,
    prefix, force, dryRun, quiet, verbose
  } = options;

  if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
  }

  let collected = [];

  if (input) {
    const fromFile = await parseInputFile(input);
    collected.push(...fromFile);
  }

  if (scrape) {
    const fromScrape = await scrapeImagesFromPage(scrape, { verbose, timeout });
    collected.push(...fromScrape);
  }

  if (urls.length) {
    collected.push(...urls);
  }

  collected = normalizeUrlList(collected);

  if (!collected.length) {
    console.error('No URLs found. Provide --input, --scrape, or direct URLs.');
    process.exit(1);
  }

  await downloadMany(collected, {
    out, concurrency, retries, timeout, prefix, force, dryRun, quiet, verbose
  });
}
