import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User, IUser } from '../models/User';
import { asyncHandler, createApiError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.object({
      email: Joi.boolean(),
      browser: Joi.boolean(),
      slack: Joi.boolean(),
    }),
    dashboard: Joi.object({
      refreshInterval: Joi.number().min(1000).max(60000),
      defaultView: Joi.string(),
    }),
  }),
});

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { username, email, password, firstName, lastName } = value;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw createApiError('User with this email or username already exists', 409);
  }

  // Create user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
  });

  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      token,
      refreshToken,
    },
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { email, password } = value;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createApiError('Invalid credentials', 401);
  }

  // Check if account is active
  if (!user.isActive) {
    throw createApiError('Account is deactivated', 401);
  }

  // Validate password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createApiError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      token,
      refreshToken,
    },
  });
}));

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: value },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw createApiError('User not found', 404);
  }

  logger.info(`User profile updated: ${user.email}`);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
    },
  });
}));

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createApiError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw createApiError('Invalid refresh token', 401);
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw createApiError('Invalid refresh token', 401);
  }
}));

// @desc    Logout user (invalidate tokens)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return success
  logger.info(`User logged out: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

export default router;
