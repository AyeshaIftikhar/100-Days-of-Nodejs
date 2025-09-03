const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Show checkout page
router.get('/', checkoutController.getCheckout);

// Create payment intent
router.post('/create-payment-intent', checkoutController.createPaymentIntent);

// Payment success callback
router.post('/payment-success', checkoutController.paymentSuccess);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), checkoutController.webhook);

module.exports = router;
