import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import Strategy from '../models/Strategy';
import { AuthRequest } from '../middleware/auth';
import { IStrategy } from '../types';

/**
 * @desc    Create a new trading strategy
 * @route   POST /api/strategies
 * @access  Private
 */
export const createStrategy = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
  }

  const strategyData: IStrategy = {
    ...req.body,
    userId: req.user.id,
  };

  const strategy = await Strategy.create(strategyData);

  res.status(201).json({
    success: true,
    data: strategy,
  });
});

/**
 * @desc    Get all strategies for current user
 * @route   GET /api/strategies
 * @access  Private
 */
export const getStrategies = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
  }

  const strategies = await Strategy.find({ userId: req.user.id });

  res.status(200).json({
    success: true,
    count: strategies.length,
    data: strategies,
  });
});

/**
 * @desc    Get a single strategy by ID
 * @route   GET /api/strategies/:id
 * @access  Private
 */
export const getStrategyById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
  }

  const strategy = await Strategy.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!strategy) {
    return res.status(404).json({
      success: false,
      error: 'Strategy not found',
    });
  }

  res.status(200).json({
    success: true,
    data: strategy,
  });
});

/**
 * @desc    Update a strategy
 * @route   PUT /api/strategies/:id
 * @access  Private
 */
export const updateStrategy = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
  }

  const strategy = await Strategy.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!strategy) {
    return res.status(404).json({
      success: false,
      error: 'Strategy not found',
    });
  }

  // Update strategy fields
  const updatedStrategy = await Strategy.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: updatedStrategy,
  });
});

/**
 * @desc    Delete a strategy
 * @route   DELETE /api/strategies/:id
 * @access  Private
 */
export const deleteStrategy = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
  }

  const strategy = await Strategy.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!strategy) {
    return res.status(404).json({
      success: false,
      error: 'Strategy not found',
    });
  }

  // Check if strategy is active
  if (strategy.isActive) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete an active strategy. Deactivate it first.',
    });
  }

  await strategy.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

/**
 * @desc    Activate or deactivate a strategy
 * @route   PATCH /api/strategies/:id/toggle-active
 * @access  Private
 */
export const toggleStrategyActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
  }

  const strategy = await Strategy.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!strategy) {
    return res.status(404).json({
      success: false,
      error: 'Strategy not found',
    });
  }

  // Toggle isActive status
  strategy.isActive = !strategy.isActive;
  await strategy.save();

  res.status(200).json({
    success: true,
    data: strategy,
  });
});
