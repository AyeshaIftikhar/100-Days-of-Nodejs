const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError('Email already in use', 400));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  });

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    }
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError('Invalid email or password', 401));
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  logger.info(`User logged in: ${user.email}`);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline
      },
      token
    }
  });
});