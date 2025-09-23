import express from 'express';
import {
  createStrategy,
  getStrategies,
  getStrategyById,
  updateStrategy,
  deleteStrategy,
  toggleStrategyActive,
} from '../controllers/strategy.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/strategies
// @desc    Create a new strategy
// @access  Private
router.post('/', createStrategy);

// @route   GET /api/strategies
// @desc    Get all strategies for the authenticated user
// @access  Private
router.get('/', getStrategies);

// @route   GET /api/strategies/:id
// @desc    Get a strategy by ID
// @access  Private
router.get('/:id', getStrategyById);

// @route   PUT /api/strategies/:id
// @desc    Update a strategy
// @access  Private
router.put('/:id', updateStrategy);

// @route   DELETE /api/strategies/:id
// @desc    Delete a strategy
// @access  Private
router.delete('/:id', deleteStrategy);

// @route   PATCH /api/strategies/:id/toggle-active
// @desc    Activate or deactivate a strategy
// @access  Private
router.patch('/:id/toggle-active', toggleStrategyActive);

export default router;
