const Feed = require('../models/Feed');
const Subscription = require('../models/Subscription');
const FeedService = require('../services/feedService');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const validator = require('../utils/validator');
const config = require('../config/feedConfig');

exports.subscribeToFeed = asyncHandler(async (req, res, next) => {
  const { url, customTitle, category } = req.body;
  const userId = req.user._id;

  if (!validator.isValidUrl(url)) {
    throw new ApiError('Invalid URL', 400);
  }

  // Check subscription limit
  const subscriptionCount = await Subscription.countDocuments({ user: userId });
  if (subscriptionCount >= config.maxFeedsPerUser) {
    throw new ApiError(`Subscription limit reached (max ${config.maxFeedsPerUser})`, 400);
  }

  // Find or create feed
  let feed = await Feed.findOne({ url });
  if (!feed) {
    const result = await FeedService.fetchFeed(url);
    feed = result.feed;
  }

  // Check if already subscribed
  const existingSubscription = await Subscription.findOne({
    user: userId,
    feed: feed._id,
  });
  if (existingSubscription) {
    throw new ApiError('Already subscribed to this feed', 400);
  }

  // Create subscription
  const subscription = await Subscription.create({
    user: userId,
    feed: feed._id,
    customTitle,
    category,
  });

  logger.info(`User ${userId} subscribed to feed ${feed._id}`);

  res.status(201).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { limit, page, category } = req.query;

  const subscriptions = await FeedService.getUserFeeds(userId, {
    limit: parseInt(limit),
    page: parseInt(page),
    category,
  });

  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    data: {
      subscriptions,
    },
  });
});

exports.unsubscribeFromFeed = asyncHandler(async (req, res, next) => {
  const { subscriptionId } = req.params;
  const userId = req.user._id;

  const subscription = await Subscription.findOneAndDelete({
    _id: subscriptionId,
    user: userId,
  });

  if (!subscription) {
    throw new ApiError('Subscription not found', 404);
  }

  logger.info(`User ${userId} unsubscribed from feed ${subscription.feed}`);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});