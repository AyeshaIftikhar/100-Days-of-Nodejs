const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');

// Google OAuth routes
router.get('/google', socialController.googleLogin);
router.get('/google/callback', socialController.googleCallback);

// GitHub OAuth routes
router.get('/github', socialController.githubLogin);
router.get('/github/callback', socialController.githubCallback);

module.exports = router;
