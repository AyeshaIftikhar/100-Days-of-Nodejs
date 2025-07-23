const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

router.post('/signup', validate.validateUser, authController.signup);
router.post('/login', authController.login);

module.exports = router;