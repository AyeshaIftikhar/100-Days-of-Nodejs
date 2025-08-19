import { Command } from 'commander';
import { run } from './runner.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read package.json manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const { version, description } = packageJson;

export async function main() {
  const program = new Command();

  program
    .name('imgdl')
    .description(description)
    .version(version)
    .argument('[urls...]', 'One or more direct image URLs')
    .option('-i, --input <path>', 'Path to a txt/csv/json file with URLs')
    .option('-s, --scrape <url>', 'Scrape <img> srcs from a webpage and download')
    .option('-o, --out <dir>', 'Output directory', 'downloads')
    .option('-c, --concurrency <n>', 'Parallel downloads', (v) => parseInt(v, 10), 5)
    .option('-r, --retries <n>', 'Retries per file', (v) => parseInt(v, 10), 3)
    .option('-t, --timeout <ms>', 'Per-request timeout in ms', (v) => parseInt(v, 10), 20000)
    .option('--prefix <text>', 'Prefix added to each saved filename')
    .option('--force', 'Overwrite existing files', false)
    .option('--dry-run', 'Show actions without saving', false)
    .option('-q, --quiet', 'Minimal logging', false)
    .option('-v, --verbose', 'Extra logging', false);

  program.parse(process.argv);
  const opts = program.opts();
  const urls = program.args || [];

  await run({ ...opts, urls });
}
