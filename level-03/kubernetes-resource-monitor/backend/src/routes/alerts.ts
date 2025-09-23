import express from 'express';
import { Alert } from '../models/Alert';
import { asyncHandler, createApiError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { status, severity, serverId } = req.query;
  const query: any = {};

  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (serverId) query.serverId = serverId;

  const alerts = await Alert.find(query)
    .populate('serverId', 'name hostname environment')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: { alerts, count: alerts.length },
  });
}));

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
router.put('/:id/acknowledge', asyncHandler(async (req: AuthRequest, res: any) => {
  const alert = await Alert.findById(req.params.id);
  if (!alert) {
    throw createApiError('Alert not found', 404);
  }

  alert.status = 'acknowledged';
  alert.acknowledgedBy = req.user._id;
  alert.acknowledgedAt = new Date();
  await alert.save();

  res.json({
    success: true,
    data: { alert },
  });
}));

export default router;
