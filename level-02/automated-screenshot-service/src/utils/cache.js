import fs from 'fs/promises';
import path from 'path';
import config from '../config/index.js';

export async function ensureCacheDir() {
  const dir = path.resolve(process.cwd(), config.OUTPUT_DIR);
  await fs.mkdir(dir, { recursive: true });
}

export async function isCacheValid(filePath) {
  try {
    const stat = await fs.stat(filePath);
    const ageSeconds = (Date.now() - stat.mtimeMs) / 1000;
    return ageSeconds < config.CACHE_TTL_SECONDS;
  } catch {
    return false;
  }
}
