const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const apiController = require('../controllers/apiController');

// Public endpoints (IP-based rate limiting)
router.get('/public', rateLimiter(), apiController.publicEndpoint);

// User endpoints (user-based rate limiting)
router.get('/user', 
  rateLimiter({ keyGenerator: req => `user:${req.user.id}` }),
  apiController.userEndpoint
);

// Admin endpoints (strict rate limiting)
router.get('/admin',
  rateLimiter({ max: 10, window: 60 }),
  apiController.adminEndpoint
);

// API key endpoints (key-based rate limiting)
router.get('/key-based',
  rateLimiter({ keyGenerator: req => `apiKey:${req.apiKey}` }),
  apiController.keyBasedEndpoint
);

module.exports = router;