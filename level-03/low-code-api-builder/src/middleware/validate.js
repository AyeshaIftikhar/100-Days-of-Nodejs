// Middleware to validate request data using Joi schemas
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details.map(detail => detail.message).join(', ')
      });
    }
    
    next();
  };
};

module.exports = validate;
