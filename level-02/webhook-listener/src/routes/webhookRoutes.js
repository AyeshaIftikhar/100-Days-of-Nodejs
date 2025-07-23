const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { rawBodyMiddleware } = require('../middleware/validate');

// Webhook endpoint
router.post('/', rawBodyMiddleware, webhookController.handleWebhook);

// For testing/debugging
router.get('/events', (req, res) => {
  res.json(webhookController.getEvents());
});

router.delete('/events', (req, res) => {
  res.json(webhookController.clearEvents());
});

module.exports = router;