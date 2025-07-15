const express = require('express');
const router = express.Router();
const extractData = require('../scraper/extract');

router.get('/scrape', async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: 'URL parameter is required' });

  const result = await extractData(url);
  res.json(result);
});

module.exports = router;
