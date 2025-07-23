const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get(
  '/google/callback',
  authController.googleAuthCallback,
  (req, res) => {
    res.redirect('/profile');
  }
);

// GitHub OAuth routes
router.get('/github', authController.githubAuth);
router.get(
  '/github/callback',
  authController.githubAuthCallback,
  (req, res) => {
    res.redirect('/profile');
  }
);

// Current user
router.get('/me', authController.getCurrentUser);

// Logout
router.get('/logout', authController.logout);

module.exports = router;