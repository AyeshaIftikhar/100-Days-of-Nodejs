const express = require('express');
const router = express.Router();
const rateLimiter = require('../middlewares/rateLimiter');
const PalindromeController = require('../controllers/palindrome');

router.get('/palindrome', rateLimiter, PalindromeController.check);

module.exports = router;