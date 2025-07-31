const FeedService = require('../services/feedService');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const validator = require('../utils/validator');

exports.discoverFeed = asyncHandler(async (req, res, next) => {
  const { url } = req.body;

  if (!validator.isValidUrl(url)) {
    throw new ApiError('Invalid URL', 400);
  }

  const existingFeed = await Feed.findOne({ url });
  if (existingFeed) {
    return res.status(200).json({
      status: 'success',
      data: {
        feed: existingFeed,
        exists: true,
      },
    });
  }

  const { feed } = await FeedService.fetchFeed(url);
  
  res.status(200).json({
    status: 'success',
    data: {
      feed,
      exists: false,
    },
  });
});

exports.getFeedItems = asyncHandler(async (req, res, next) => {
  const { feedId } = req.params;
  const { limit, page, readStatus } = req.query;
  const userId = req.user._id;

  // Check if user is subscribed to the feed
  const subscription = await Subscription.findOne({ user: userId, feed: feedId });
  if (!subscription) {
    throw new ApiError('Not subscribed to this feed', 403);
  }

  const items = await FeedService.getFeedItems(feedId, userId, {
    limit: parseInt(limit),
    page: parseInt(page),
    readStatus,
  });

  res.status(200).json({
    status: 'success',
    results: items.length,
    data: {
      items,
    },
  });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  const item = await FeedItem.findById(itemId).populate('feed');
  if (!item) {
    throw new ApiError('Item not found', 404);
  }

  // Verify user has access to this feed
  const subscription = await Subscription.findOne({
    user: userId,
    feed: item.feed._id,
  });
  if (!subscription) {
    throw new ApiError('Not authorized', 403);
  }

  item.isRead = true;
  await item.save();

  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
});