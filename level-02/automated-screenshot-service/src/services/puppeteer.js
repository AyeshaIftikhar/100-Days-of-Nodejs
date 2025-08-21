import puppeteer from 'puppeteer';
import config from '../config/index.js';

let browser = null;

export async function getBrowser() {
  if (browser && browser.isConnected()) return browser;
  browser = await puppeteer.launch({
    headless: config.PUPPETEER_HEADLESS ? 'new' : false,
    executablePath: config.CHROME_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--disable-dev-shm-usage'
    ]
  });
  browser.on('disconnected', () => { browser = null; });
  return browser;
}

export async function newPage() {
  const b = await getBrowser();
  const page = await b.newPage();
  page.setDefaultNavigationTimeout(45000);
  page.setDefaultTimeout(45000);
  return page;
}

export async function closeBrowser() {
  if (browser) {
    try { await browser.close(); } catch (_) {}
    browser = null;
  }
}
