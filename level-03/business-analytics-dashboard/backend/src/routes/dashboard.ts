import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// Mock dashboard data
const getDashboardMetrics = (userId: string) => ({
  totalRevenue: {
    current: 245670,
    previous: 198450,
    change: 23.8,
  },
  totalUsers: {
    current: 1248,
    previous: 1156,
    change: 7.9,
  },
  activeProjects: {
    current: 34,
    previous: 28,
    change: 21.4,
  },
  conversionRate: {
    current: 3.24,
    previous: 2.87,
    change: 12.9,
  },
  recentActivity: [
    { id: 1, type: 'sale', description: 'New sale: $2,450', timestamp: '2024-01-20T10:30:00Z' },
    { id: 2, type: 'user', description: 'New user registered', timestamp: '2024-01-20T09:45:00Z' },
    { id: 3, type: 'project', description: 'Project "Analytics Dashboard" completed', timestamp: '2024-01-20T08:15:00Z' },
    { id: 4, type: 'alert', description: 'High traffic detected', timestamp: '2024-01-20T07:30:00Z' },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 45000, users: 1200 },
    { month: 'Feb', revenue: 52000, users: 1350 },
    { month: 'Mar', revenue: 48000, users: 1280 },
    { month: 'Apr', revenue: 61000, users: 1450 },
    { month: 'May', revenue: 55000, users: 1380 },
    { month: 'Jun', revenue: 67000, users: 1520 },
  ],
  topProjects: [
    { id: 1, name: 'E-commerce Platform', progress: 87, revenue: 45000 },
    { id: 2, name: 'Mobile App', progress: 62, revenue: 32000 },
    { id: 3, name: 'Analytics Dashboard', progress: 94, revenue: 28000 },
    { id: 4, name: 'CRM System', progress: 45, revenue: 15000 },
  ],
})

// Get dashboard overview
router.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const metrics = getDashboardMetrics(userId)
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
})

// Get recent activity
router.get('/activity', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { limit = 10, page = 1 } = req.query
    const activities = getDashboardMetrics(userId).recentActivity
    
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedActivities = activities.slice(startIndex, endIndex)

    res.json({
      activities: paginatedActivities,
      total: activities.length,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity data' })
  }
})

// Get metrics summary
router.get('/metrics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const data = getDashboardMetrics(userId)
    const metrics = {
      totalRevenue: data.totalRevenue,
      totalUsers: data.totalUsers,
      activeProjects: data.activeProjects,
      conversionRate: data.conversionRate,
    }

    res.json(metrics)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch metrics' })
  }
})

export default router
