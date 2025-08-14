const express = require('express');
const router = express.Router();


const emailController = require('../controllers/emailController');

// Send a single email
router.post('/', emailController.sendEmail);

// Send bulk emails
router.post('/bulk', emailController.sendBulkEmails);

// Create a new email template
router.post('/template', emailController.createTemplate);

// Get all email templates
router.get('/templates', emailController.getTemplates);

module.exports = router;
