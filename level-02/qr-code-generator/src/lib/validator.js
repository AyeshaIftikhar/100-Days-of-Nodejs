class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function validateQRRequest(text) {
  if (!text) {
    throw new ValidationError('Text content is required');
  }
  
  if (typeof text !== 'string') {
    throw new ValidationError('Text must be a string');
  }
  
  if (text.length > 1000) {
    throw new ValidationError('Text too long (max 1000 chars)');
  }
  
  // Basic check for malicious content
  if (text.includes('<script>') || text.includes('javascript:')) {
    throw new ValidationError('Invalid text content');
  }
}

module.exports = { validateQRRequest, ValidationError };