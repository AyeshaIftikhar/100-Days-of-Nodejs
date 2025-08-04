const express = require('express');
const router = express.Router();
const QRGenerator = require('../lib/qrGenerator');
const { validateQRRequest } = require('../lib/validator');
const { success, error } = require('../lib/response');
const logger = require('../utils/logger');

router.get('/generate', async (req, res) => {
  try {
    const { text, format = 'png', ...options } = req.query;
    
    validateQRRequest(text);
    
    const qrBuffer = await QRGenerator.generate(text, options);
    
    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Length', qrBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.end(qrBuffer);
  } catch (err) {
    logger.error(`Generation error: ${err.message}`);
    error(res, err.message, err.statusCode || 500);
  }
});

router.post('/generate', express.json(), async (req, res) => {
  try {
    const { text, format = 'png', ...options } = req.body;
    
    validateQRRequest(text);
    
    const qrBuffer = await QRGenerator.generate(text, options);
    
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="qr-code.${format}"`);
    }
    
    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Length', qrBuffer.length);
    res.send(qrBuffer);
  } catch (err) {
    logger.error(`Generation error: ${err.message}`);
    error(res, err.message, err.statusCode || 500);
  }
});

module.exports = router;