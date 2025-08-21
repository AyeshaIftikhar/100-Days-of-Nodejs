import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { newPage } from './puppeteer.js';
import config from '../config/index.js';
import { hashParams } from '../utils/hash.js';
import { ensureCacheDir, isCacheValid } from '../utils/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputsPath = path.resolve(__dirname, '..', '..', config.OUTPUT_DIR);

export async function captureScreenshot(params) {
  await ensureCacheDir();

  const {
    url,
    width = 1366,
    height = 768,
    deviceScaleFactor = 1,
    fullPage = true,
    format = 'png', // png | jpeg | webp
    quality,        // 0..100 (jpeg/webp)
    delayMs = 0,
    waitUntil = 'networkidle0' // 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
  } = params;

  const key = `shot:${hashParams({ url, width, height, deviceScaleFactor, fullPage, format, quality, delayMs, waitUntil })}`;
  const filename = `${key}.${format}`;
  const filepath = path.join(outputsPath, filename);

  if (config.ALLOW_CACHE && await isCacheValid(filepath)) {
    return { cached: true, file: `/files/${filename}`, path: filepath };
  }

  const page = await newPage();
  try {
    await page.setViewport({ width, height, deviceScaleFactor });
    await page.goto(url, { waitUntil });
    if (delayMs > 0) await page.waitForTimeout(delayMs);

    await page.screenshot({
      path: filepath,
      type: format,
      quality: typeof quality === 'number' ? quality : undefined,
      fullPage
    });

    return { cached: false, file: `/files/${filename}`, path: filepath };
  } finally {
    await page.close().catch(() => {});
  }
}

export async function capturePDF(params) {
  await ensureCacheDir();

  const {
    url,
    format = 'A4',             // e.g., 'A4', 'Letter'
    printBackground = true,
    margin = { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    delayMs = 0,
    waitUntil = 'networkidle0'
  } = params;

  const key = `pdf:${hashParams({ url, format, printBackground, margin, delayMs, waitUntil })}`;
  const filename = `${key}.pdf`;
  const filepath = path.join(outputsPath, filename);

  if (config.ALLOW_CACHE && await isCacheValid(filepath)) {
    return { cached: true, file: `/files/${filename}`, path: filepath };
  }

  const page = await newPage();
  try {
    await page.goto(url, { waitUntil });
    if (delayMs > 0) await page.waitForTimeout(delayMs);

    await page.pdf({
      path: filepath,
      format,
      printBackground,
      margin
    });

    return { cached: false, file: `/files/${filename}`, path: filepath };
  } finally {
    await page.close().catch(() => {});
  }
}
