const cron = require('node-cron');
const FeedFetcher = require('./feedFetcher');
const config = require('../config/feedConfig');
const logger = require('../utils/logger');

class Scheduler {
  static init() {
    // Schedule feed fetching
    cron.schedule(`*/${config.fetchInterval} * * * *`, () => {
      logger.info('Running scheduled feed fetch');
      FeedFetcher.fetchAllFeeds();
    });

    logger.info(`Feed scheduler initialized with ${config.fetchInterval} minute interval`);
  }
}

module.exports = Scheduler;