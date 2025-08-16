const express = require('express');
const router = express.Router();
const alphaVantageService = require('../services/alphaVantageService');
const cacheService = require('../services/cacheService');

// GET /api/stocks/:symbol - Get current stock data
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const cached = await cacheService.get(symbol);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const data = await alphaVantageService.getCurrentStockData(symbol);
    await cacheService.set(symbol, JSON.stringify(data));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stocks/:symbol/history - Get historical data
router.get('/:symbol/history', async (req, res) => {
  const { symbol } = req.params;
  try {
    const data = await alphaVantageService.getHistoricalData(symbol);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
