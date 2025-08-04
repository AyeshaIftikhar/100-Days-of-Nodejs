const QRGenerator = require('../lib/qrGenerator');
const { validateQRRequest } = require('../lib/validator');
const { success, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
    const params = event.httpMethod === 'POST' 
      ? JSON.parse(event.body) 
      : event.queryStringParameters;
    
    const { text, format = 'png', ...options } = params;
    
    validateQRRequest(text);
    
    const qrBuffer = await QRGenerator.generate(text, options);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=86400'
      },
      body: qrBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
};