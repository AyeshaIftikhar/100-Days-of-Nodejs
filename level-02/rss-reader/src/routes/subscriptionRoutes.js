const express = require('express');
const router = express.Router();

// POST /api/v1/subscriptions - Subscribe to a feed
router.post('/', (req, res) => {
  // Placeholder: Subscribe to a feed using req.body.feedUrl
  const { feedUrl } = req.body;
  if (!feedUrl) {
    return res.status(400).json({ error: 'Feed URL is required.' });
  }
  // TODO: Add subscription logic
  res.json({ message: `Subscribed to feed: ${feedUrl}` });
});

// GET /api/v1/subscriptions - List all subscriptions
router.get('/', (req, res) => {
  // TODO: Fetch all subscriptions for the user
  res.json({ message: 'List of subscriptions will go here.' });
});

// DELETE /api/v1/subscriptions/:subscriptionId - Unsubscribe from a feed
router.delete('/:subscriptionId', (req, res) => {
  const { subscriptionId } = req.params;
  // TODO: Remove the subscription
  res.json({ message: `Unsubscribed from subscription ${subscriptionId}` });
});

module.exports = router;
