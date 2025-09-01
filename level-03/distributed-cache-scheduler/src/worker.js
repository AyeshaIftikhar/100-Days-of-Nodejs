/**
 * Worker process — runs job handlers and processes queue jobs.
 * Start multiple copies to simulate distributed workers.
 */
require('dotenv').config();
const pino = require('pino');
const scheduler = require('./lib/scheduler');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function start() {
  await scheduler.initWorker();
  logger.info('Worker initialized and listening for jobs...');
}

start().catch(err => {
  logger.error(err, 'Worker failed');
  process.exit(1);
});
