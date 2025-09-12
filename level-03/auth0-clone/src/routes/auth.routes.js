const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateJwt } = require('../middleware/auth.middleware');
const { strictRateLimiter } = require('../middleware/rate-limiter.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', strictRateLimiter, authController.requestPasswordReset);
router.post('/reset-password', strictRateLimiter, authController.resetPassword);

// Protected routes
router.post('/logout', authenticateJwt, authController.logout);
router.post('/logout-all', authenticateJwt, authController.logoutAll);

module.exports = router;
