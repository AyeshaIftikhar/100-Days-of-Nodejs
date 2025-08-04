const QRGenerator = require('../lib/qrGenerator');
const { validateQRRequest } = require('../lib/validator');
const { success, error } = require('../lib/response');

module.exports = async (req, res) => {
  try {
    const { text, format = 'png', ...options } = req.method === 'POST' ? req.body : req.query;
    
    validateQRRequest(text);
    
    const qrBuffer = await QRGenerator.generate(text, options);
    
    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(qrBuffer);
  } catch (err) {
    error(res, err.message, err.statusCode || 500);
  }
};