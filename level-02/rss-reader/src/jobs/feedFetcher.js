const Feed = require('../models/Feed');
const FeedService = require('../services/feedService');
const logger = require('../utils/logger');

class FeedFetcher {
  static async fetchAllFeeds() {
    try {
      const activeFeeds = await Feed.find({ isActive: true });
      logger.info(`Starting feed fetch for ${activeFeeds.length} feeds`);

      for (const feed of activeFeeds) {
        try {
          await FeedService.fetchFeed(feed.url, feed);
          logger.debug(`Successfully updated feed: ${feed.url}`);
        } catch (error) {
          logger.error(`Error updating feed ${feed.url}: ${error.message}`);
        }
      }

      logger.info('Completed feed fetch cycle');
    } catch (error) {
      logger.error(`Feed fetcher error: ${error.message}`);
    }
  }
}

module.exports = FeedFetcher;