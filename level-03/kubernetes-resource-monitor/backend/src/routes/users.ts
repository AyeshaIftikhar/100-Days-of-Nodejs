import express from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authorize('admin'), asyncHandler(async (req: any, res: any) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: { users, count: users.length },
  });
}));

export default router;
