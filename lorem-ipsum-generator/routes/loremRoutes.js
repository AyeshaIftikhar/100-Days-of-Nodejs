const express = require('express');
const router = express.Router();
const { generateLorem } = require('../controllers/loremController');

router.get('/generate', generateLorem);

module.exports = router;
