const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

router.get('/about', (req, res) => {
  res.send('About page');
});

router.get('/slow', async (req, res) => {
  // Simulate a slow endpoint
  await new Promise(resolve => setTimeout(resolve, 1000));
  res.send('Slow response done');
});

module.exports = router;
