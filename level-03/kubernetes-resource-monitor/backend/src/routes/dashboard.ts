import express from 'express';
import { Metric } from '../models/Metric';
import { Server } from '../models/Server';
import { Alert } from '../models/Alert';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
router.get('/summary', asyncHandler(async (req: any, res: any) => {
  const [
    totalServers,
    activeServers,
    activeAlerts,
    totalMetrics,
    latestMetrics
  ] = await Promise.all([
    Server.countDocuments(),
    Server.countDocuments({ isActive: true }),
    Alert.countDocuments({ status: 'active' }),
    Metric.countDocuments(),
    Metric.find()
      .populate('serverId', 'name hostname environment')
      .sort({ timestamp: -1 })
      .limit(10)
      .lean()
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalServers,
        activeServers,
        offlineServers: totalServers - activeServers,
        activeAlerts,
        totalMetrics,
      },
      latestMetrics,
    },
  });
}));

export default router;
