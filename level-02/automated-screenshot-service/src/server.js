import app from './app.js';
import config from './config/index.js';
import { ensureCacheDir } from './utils/cache.js';
import { getBrowser, closeBrowser } from './services/puppeteer.js';

const server = app.listen(config.PORT, async () => {
  await ensureCacheDir();
  await getBrowser(); // warm-up
  console.log(`✅ Automated Screenshot Service running on http://localhost:${config.PORT}`);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  await closeBrowser();
  server.close(() => process.exit(0));
});
