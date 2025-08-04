class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function validateSymbol(symbol) {
  if (!symbol) {
    throw new ValidationError('Stock symbol is required');
  }
  
  if (typeof symbol !== 'string') {
    throw new ValidationError('Stock symbol must be a string');
  }
  
  if (symbol.length > 5) {
    throw new ValidationError('Stock symbol must be 5 characters or less');
  }
  
  if (!/^[A-Za-z]+$/.test(symbol)) {
    throw new ValidationError('Stock symbol must contain only letters');
  }
}

module.exports = { validateSymbol, ValidationError };