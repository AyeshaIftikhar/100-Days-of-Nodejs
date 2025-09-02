const express = require('express');
const router = express.Router();
const feedService = require('../services/feedService');

// returns aggregated items JSON
router.get('/feeds', async (req, res) => {
  try {
    const all = await feedService.getAggregatedFeeds();
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed' });
  }
});

// get single item by encoded id
router.get('/item/:encoded', async (req, res) => {
  try {
    const item = await feedService.getItemByEncodedId(req.params.encoded);
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
