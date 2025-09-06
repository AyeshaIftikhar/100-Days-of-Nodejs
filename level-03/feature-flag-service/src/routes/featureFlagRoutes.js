const express = require('express');
const featureFlagController = require('../controllers/featureFlagController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Project-level flag routes
router.route('/projects/:projectId/flags')
  .get(protect, featureFlagController.getProjectFlags)
  .post(protect, featureFlagController.createFlag);

// Evaluation routes
router.post('/projects/:projectId/evaluate', featureFlagController.evaluateFlag);
router.post('/projects/:projectId/evaluate-batch', featureFlagController.evaluateBatch);

// Individual flag routes
router.route('/flags/:id')
  .get(protect, featureFlagController.getFlag)
  .put(protect, featureFlagController.updateFlag)
  .delete(protect, featureFlagController.deleteFlag);

// Analytics route
router.get('/flags/:id/analytics', protect, featureFlagController.getFlagAnalytics);

module.exports = router;
