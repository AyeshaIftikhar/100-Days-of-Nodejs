const Joi = require('joi');

// User register validation
exports.registerValidator = Joi.object({
  username: Joi.string().required().min(3).max(30),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
});

// User login validation
exports.loginValidator = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});
