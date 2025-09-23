import express from 'express';
import { Server } from '../models/Server';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// @desc    Get all servers
// @route   GET /api/servers
// @access  Private
router.get('/', asyncHandler(async (req: any, res: any) => {
  const servers = await Server.find()
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: { servers, count: servers.length },
  });
}));

export default router;
