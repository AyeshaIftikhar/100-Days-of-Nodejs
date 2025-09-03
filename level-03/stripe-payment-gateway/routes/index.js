const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { title: 'Stripe Payment Gateway Demo' });
});

module.exports = router;
