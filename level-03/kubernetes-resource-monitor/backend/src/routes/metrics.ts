import express from 'express';
import Joi from 'joi';
import { Metric } from '../models/Metric';
import { Server } from '../models/Server';
import { asyncHandler, createApiError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const getMetricsSchema = Joi.object({
  serverId: Joi.string(),
  startTime: Joi.date(),
  endTime: Joi.date(),
  interval: Joi.string().valid('1m', '5m', '15m', '1h', '1d').default('5m'),
  limit: Joi.number().min(1).max(1000).default(100),
});

// @desc    Get metrics for servers
// @route   GET /api/metrics
// @access  Private
router.get('/', asyncHandler(async (req: any, res: any) => {
  const { error, value } = getMetricsSchema.validate(req.query);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { serverId, startTime, endTime, interval, limit } = value;
  const query: any = {};

  if (serverId) {
    query.serverId = serverId;
  }

  if (startTime || endTime) {
    query.timestamp = {};
    if (startTime) query.timestamp.$gte = new Date(startTime);
    if (endTime) query.timestamp.$lte = new Date(endTime);
  }

  const metrics = await Metric.find(query)
    .populate('serverId', 'name hostname environment')
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    data: {
      metrics,
      count: metrics.length,
    },
  });
}));

// @desc    Get latest metrics for a specific server
// @route   GET /api/metrics/latest/:serverId
// @access  Private
router.get('/latest/:serverId', asyncHandler(async (req: any, res: any) => {
  const { serverId } = req.params;

  const metric = await Metric.findOne({ serverId })
    .populate('serverId', 'name hostname environment type')
    .sort({ timestamp: -1 })
    .lean();

  if (!metric) {
    throw createApiError('No metrics found for this server', 404);
  }

  res.json({
    success: true,
    data: {
      metric,
    },
  });
}));

// @desc    Get aggregated metrics for dashboard
// @route   GET /api/metrics/dashboard
// @access  Private
router.get('/dashboard', asyncHandler(async (req: any, res: any) => {
  const timeframe = req.query.timeframe || '1h';
  let startTime = new Date();

  switch (timeframe) {
    case '5m':
      startTime.setMinutes(startTime.getMinutes() - 5);
      break;
    case '15m':
      startTime.setMinutes(startTime.getMinutes() - 15);
      break;
    case '1h':
      startTime.setHours(startTime.getHours() - 1);
      break;
    case '6h':
      startTime.setHours(startTime.getHours() - 6);
      break;
    case '1d':
      startTime.setDate(startTime.getDate() - 1);
      break;
    default:
      startTime.setHours(startTime.getHours() - 1);
  }

  // Get latest metrics for all active servers
  const servers = await Server.find({ isActive: true });
  const dashboardData = [];

  for (const server of servers) {
    const latestMetric = await Metric.findOne({
      serverId: server._id,
      timestamp: { $gte: startTime }
    })
      .sort({ timestamp: -1 })
      .lean();

    if (latestMetric) {
      dashboardData.push({
        server: {
          id: server._id,
          name: server.name,
          hostname: server.hostname,
          environment: server.environment,
          type: server.type,
        },
        metrics: latestMetric,
      });
    }
  }

  // Calculate aggregate statistics
  const totalServers = servers.length;
  const activeServers = dashboardData.length;
  const offlineServers = totalServers - activeServers;

  const aggregateStats = {
    avgCpuUsage: 0,
    avgMemoryUsage: 0,
    avgDiskUsage: 0,
    totalUptime: 0,
  };

  if (dashboardData.length > 0) {
    aggregateStats.avgCpuUsage = dashboardData.reduce((sum, item) => sum + item.metrics.cpu.usage, 0) / dashboardData.length;
    aggregateStats.avgMemoryUsage = dashboardData.reduce((sum, item) => sum + item.metrics.memory.percentage, 0) / dashboardData.length;
    aggregateStats.avgDiskUsage = dashboardData.reduce((sum, item) => sum + item.metrics.disk.percentage, 0) / dashboardData.length;
    aggregateStats.totalUptime = dashboardData.reduce((sum, item) => sum + item.metrics.uptime, 0);
  }

  res.json({
    success: true,
    data: {
      servers: dashboardData,
      statistics: {
        totalServers,
        activeServers,
        offlineServers,
        ...aggregateStats,
      },
      timeframe,
    },
  });
}));

// @desc    Get historical metrics for charts
// @route   GET /api/metrics/history/:serverId
// @access  Private
router.get('/history/:serverId', asyncHandler(async (req: any, res: any) => {
  const { serverId } = req.params;
  const timeframe = req.query.timeframe || '1h';
  const metricType = req.query.type || 'cpu'; // cpu, memory, disk, network

  let startTime = new Date();
  let groupBy = '$minute';

  switch (timeframe) {
    case '1h':
      startTime.setHours(startTime.getHours() - 1);
      groupBy = '$minute';
      break;
    case '6h':
      startTime.setHours(startTime.getHours() - 6);
      groupBy = '$minute';
      break;
    case '1d':
      startTime.setDate(startTime.getDate() - 1);
      groupBy = '$hour';
      break;
    case '7d':
      startTime.setDate(startTime.getDate() - 7);
      groupBy = '$hour';
      break;
    case '30d':
      startTime.setDate(startTime.getDate() - 30);
      groupBy = '$dayOfMonth';
      break;
  }

  const pipeline = [
    {
      $match: {
        serverId,
        timestamp: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' },
          minute: groupBy === '$minute' ? { $minute: '$timestamp' } : null,
        },
        avgCpuUsage: { $avg: '$cpu.usage' },
        avgMemoryUsage: { $avg: '$memory.percentage' },
        avgDiskUsage: { $avg: '$disk.percentage' },
        avgNetworkIn: { $avg: '$network.bytesIn' },
        avgNetworkOut: { $avg: '$network.bytesOut' },
        timestamp: { $first: '$timestamp' },
      }
    },
    {
      $sort: { timestamp: 1 }
    }
  ];

  const historicalData = await Metric.aggregate(pipeline);

  res.json({
    success: true,
    data: {
      serverId,
      timeframe,
      metricType,
      data: historicalData,
    },
  });
}));

export default router;
