import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// Mock analytics data
const getAnalyticsData = () => ({
  revenue: {
    daily: [
      { date: '2024-01-15', amount: 2450 },
      { date: '2024-01-16', amount: 3200 },
      { date: '2024-01-17', amount: 1800 },
      { date: '2024-01-18', amount: 4100 },
      { date: '2024-01-19', amount: 2900 },
      { date: '2024-01-20', amount: 3700 },
    ],
    monthly: [
      { month: 'Jan 2024', amount: 65000 },
      { month: 'Feb 2024', amount: 72000 },
      { month: 'Mar 2024', amount: 68000 },
      { month: 'Apr 2024', amount: 81000 },
      { month: 'May 2024', amount: 75000 },
      { month: 'Jun 2024', amount: 87000 },
    ],
  },
  users: {
    acquisition: [
      { date: '2024-01-15', users: 45 },
      { date: '2024-01-16', users: 52 },
      { date: '2024-01-17', users: 38 },
      { date: '2024-01-18', users: 67 },
      { date: '2024-01-19', users: 49 },
      { date: '2024-01-20', users: 73 },
    ],
    retention: {
      day1: 85,
      day7: 65,
      day30: 45,
    },
  },
  traffic: {
    sources: [
      { source: 'Organic Search', visitors: 3420, percentage: 42 },
      { source: 'Direct', visitors: 2140, percentage: 26 },
      { source: 'Social Media', visitors: 1380, percentage: 17 },
      { source: 'Referral', visitors: 820, percentage: 10 },
      { source: 'Email', visitors: 410, percentage: 5 },
    ],
    pageViews: [
      { page: '/dashboard', views: 12450 },
      { page: '/analytics', views: 8320 },
      { page: '/projects', views: 6180 },
      { page: '/settings', views: 3940 },
    ],
  },
  conversion: {
    funnel: [
      { stage: 'Visitors', count: 8150, percentage: 100 },
      { stage: 'Signups', count: 650, percentage: 8 },
      { stage: 'Trial Users', count: 324, percentage: 4 },
      { stage: 'Paid Users', count: 97, percentage: 1.2 },
    ],
    bySource: [
      { source: 'Organic', conversions: 45, rate: 3.2 },
      { source: 'Paid Ads', conversions: 32, rate: 4.8 },
      { source: 'Social', conversions: 15, rate: 2.1 },
      { source: 'Email', conversions: 5, rate: 1.8 },
    ],
  },
})

// Get revenue analytics
router.get('/revenue', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { period = 'monthly' } = req.query as any
    const data = getAnalyticsData()

    res.json({
      revenue: period === 'daily' ? data.revenue.daily : data.revenue.monthly,
      period,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue analytics' })
  }
})

// Get user analytics
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const data = getAnalyticsData()
    res.json(data.users)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user analytics' })
  }
})

// Get traffic analytics
router.get('/traffic', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const data = getAnalyticsData()
    res.json(data.traffic)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch traffic analytics' })
  }
})

// Get conversion analytics
router.get('/conversion', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const data = getAnalyticsData()
    res.json(data.conversion)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversion analytics' })
  }
})

// Get complete analytics overview
router.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const data = getAnalyticsData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics overview' })
  }
})

export default router
