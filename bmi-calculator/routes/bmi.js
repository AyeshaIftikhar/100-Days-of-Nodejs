const express = require('express');
const router = express.Router();
const bmiController = require('../controllers/bmi-controller');

// Calculate BMI
router.post('/calculate', bmiController.calculateBMI);

// Get BMI category
router.get('/category/:bmi', bmiController.getBMICategory);

module.exports = router;