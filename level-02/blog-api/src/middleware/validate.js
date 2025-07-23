const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

exports.validateUser = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }
    next();
  }
];

exports.validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }
    next();
  }
];

exports.validateComment = [
  body('content').notEmpty().withMessage('Comment content is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(errors.array()[0].msg, 400));
    }
    next();
  }
];