import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/error';
import User from '../models/User';
import config from '../config';
import { IAuthResponse, IJwtPayload } from '../types';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email, user.role);

  // Return user data and token
  const response: IAuthResponse = {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      apiKeys: user.apiKeys,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };

  res.status(201).json({
    success: true,
    data: response,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email with password included
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists and password matches
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.email, user.role);

  // Return user data and token
  const response: IAuthResponse = {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      apiKeys: user.apiKeys,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };

  res.status(200).json({
    success: true,
    data: response,
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      apiKeys: user.apiKeys,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * Generate JWT token
 */
const generateToken = (id: string, email: string, role: string): string => {
  const payload: IJwtPayload = {
    id,
    email,
    role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};
