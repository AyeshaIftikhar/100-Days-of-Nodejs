const axios = require('axios');
const Feed = require('../models/Feed');
const FeedItem = require('../models/FeedItem');
const RssParser = require('../parsers/rssParser');
const AtomParser = require('../parsers/atomParser');
const config = require('../config/feedConfig');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');

class FeedService {
  static async fetchFeed(feedUrl, existingFeed = null) {
    try {
      const headers = {};
      if (existingFeed) {
        if (existingFeed.etag) headers['If-None-Match'] = existingFeed.etag;
        if (existingFeed.lastModified) headers['If-Modified-Since'] = existingFeed.lastModified;
      }

      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': config.userAgent,
          ...headers,
        },
        timeout: config.requestTimeout,
      });

      if (response.status === 304) {
        logger.debug(`Feed not modified: ${feedUrl}`);
        return { updated: false };
      }

      const contentType = response.headers['content-type'] || '';
      let parser;
      if (contentType.includes('xml') || contentType.includes('rss') || contentType.includes('atom')) {
        parser = contentType.includes('atom') ? AtomParser : RssParser;
      } else {
        // Try to detect format from content
        parser = response.data.includes('<feed') ? AtomParser : RssParser;
      }

      const { feed, items } = await parser.parse(response.data);

      // Update or create feed
      const feedData = {
        title: feed.title,
        description: helpers.truncate(feed.description, config.maxDescriptionLength),
        link: feed.link,
        language: feed.language,
        lastFetched: new Date(),
        lastModified: response.headers['last-modified'] || null,
        etag: response.headers.etag || null,
        image: feed.image,
        isActive: true,
      };

      const updatedFeed = existingFeed
        ? await Feed.findByIdAndUpdate(existingFeed._id, feedData, { new: true })
        : await Feed.create({ ...feedData, url: feedUrl });

      // Process feed items
      const newItems = await this.processFeedItems(updatedFeed._id, items);

      return {
        updated: true,
        feed: updatedFeed,
        newItems,
      };
    } catch (error) {
      logger.error(`Error fetching feed ${feedUrl}: ${error.message}`);
      if (existingFeed) {
        await Feed.findByIdAndUpdate(existingFeed._id, { isActive: false });
      }
      throw error;
    }
  }

  static async processFeedItems(feedId, items) {
    const newItems = [];
    
    for (const item of items) {
      try {
        const existingItem = await FeedItem.findOne({ feed: feedId, guid: item.guid });
        if (!existingItem) {
          const newItem = await FeedItem.create({
            feed: feedId,
            ...item,
            description: helpers.truncate(item.description, config.maxDescriptionLength),
          });
          newItems.push(newItem);
        }
      } catch (error) {
        logger.error(`Error processing feed item: ${error.message}`);
      }
    }

    return newItems;
  }

  static async getUserFeeds(userId, options = {}) {
    const { limit = config.defaultLimit, page = 1, category } = options;
    const skip = (page - 1) * limit;

    const query = {
      user: userId,
      isActive: true,
    };

    if (category) {
      query.category = category;
    }

    const subscriptions = await Subscription.find(query)
      .populate('feed')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    return subscriptions;
  }

  static async getFeedItems(feedId, userId, options = {}) {
    const { limit = config.defaultLimit, page = 1, readStatus } = options;
    const skip = (page - 1) * limit;

    const query = { feed: feedId };
    if (readStatus !== undefined) {
      query.isRead = readStatus === 'read';
    }

    const items = await FeedItem.find(query)
      .sort('-pubDate')
      .skip(skip)
      .limit(limit);

    return items;
  }
}

module.exports = FeedService;