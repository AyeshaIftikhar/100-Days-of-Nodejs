const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders
router.get('/', orderController.getOrders);

// Get single order by ID
router.get('/:id', orderController.getOrderById);

// Get orders by customer email
router.get('/customer/:email', orderController.getOrdersByEmail);

module.exports = router;
