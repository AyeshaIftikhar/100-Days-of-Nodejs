const express = require('express');
const router = express.Router();

// GET /health - Health check endpoint
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
