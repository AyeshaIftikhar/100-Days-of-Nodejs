import 'dotenv/config';

const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
  AUTH_TOKEN: process.env.AUTH_TOKEN || null,

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 60),

  CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH || null,
  PUPPETEER_HEADLESS: (process.env.PUPPETEER_HEADLESS || 'true') === 'true',

  OUTPUT_DIR: process.env.OUTPUT_DIR || './storage/outputs',
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 3600),
  ALLOW_CACHE: (process.env.ALLOW_CACHE || 'true') === 'true'
};

export default config;
