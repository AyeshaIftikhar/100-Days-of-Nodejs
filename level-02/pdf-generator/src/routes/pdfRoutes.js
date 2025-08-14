const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');


// PDF Generation
router.post('/invoice', validate.validateInvoice, pdfController.generateInvoice);
router.post('/certificate', validate.validateCertificate, pdfController.generateCertificate);
router.post('/template', auth.protect, validate.validateTemplate, pdfController.generateFromTemplate);

// Template Management
router.post('/templates', auth.protect, pdfController.createTemplate);
router.get('/templates', auth.protect, pdfController.getTemplates);

module.exports = router;