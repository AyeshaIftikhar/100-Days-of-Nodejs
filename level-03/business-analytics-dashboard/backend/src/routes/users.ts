import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// Mock users data (in production, this would come from database)
const users = [
  {
    id: '1',
    email: 'admin@dashboard.com',
    name: 'Admin User',
    role: 'admin',
    subscription: 'enterprise',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    email: 'user@dashboard.com',
    name: 'Regular User',
    role: 'user',
    subscription: 'professional',
    avatar: null,
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-01-19T15:45:00Z',
  },
]

// Get current user profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = users.find(u => u.id === userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { ...userProfile } = user
    res.json(userProfile)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile' })
  }
})

// Update user profile
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { name, email } = req.body as any
    if (name) users[userIndex].name = name
    if (email) users[userIndex].email = email

    const { ...updatedProfile } = users[userIndex]
    res.json(updatedProfile)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user profile' })
  }
})

// Get user settings
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Mock settings data
    const settings = {
      notifications: {
        email: true,
        push: false,
        sms: false,
      },
      privacy: {
        profileVisibility: 'private',
        dataSharing: false,
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
      },
    }

    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user settings' })
  }
})

// Update user settings
router.put('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // In production, save settings to database
    const settings = req.body

    res.json({
      message: 'Settings updated successfully',
      settings,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user settings' })
  }
})

// Get user subscription info
router.get('/subscription', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = users.find(u => u.id === userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const subscription = {
      plan: user.subscription,
      status: 'active',
      billingCycle: 'monthly',
      nextBilling: '2024-02-20T00:00:00Z',
      features: user.subscription === 'enterprise' 
        ? ['unlimited_projects', 'priority_support', 'custom_integrations', 'advanced_analytics']
        : user.subscription === 'professional'
        ? ['advanced_analytics', 'email_support', 'custom_reports']
        : ['basic_analytics', 'community_support'],
    }

    res.json(subscription)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscription info' })
  }
})

export default router
