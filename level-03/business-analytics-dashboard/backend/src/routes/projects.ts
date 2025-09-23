import { Router, Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// Mock projects data
const projects = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Modern e-commerce solution with React and Node.js',
    status: 'active',
    progress: 87,
    startDate: '2024-01-01',
    endDate: '2024-03-15',
    budget: 50000,
    revenue: 45000,
    team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    tasks: 24,
    completedTasks: 21,
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application using React Native',
    status: 'active',
    progress: 62,
    startDate: '2024-02-01',
    endDate: '2024-05-30',
    budget: 40000,
    revenue: 32000,
    team: ['Sarah Wilson', 'Tom Brown'],
    tasks: 18,
    completedTasks: 11,
  },
  {
    id: '3',
    name: 'Analytics Dashboard',
    description: 'Business intelligence dashboard for data visualization',
    status: 'completed',
    progress: 100,
    startDate: '2023-11-01',
    endDate: '2024-01-15',
    budget: 30000,
    revenue: 28000,
    team: ['Alice Cooper', 'Bob Johnson'],
    tasks: 15,
    completedTasks: 15,
  },
]

// Get all projects
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { status, limit = 10, page = 1 } = req.query as any
    
    let filteredProjects = projects
    if (status) {
      filteredProjects = projects.filter(project => project.status === status)
    }

    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    res.json({
      projects: paginatedProjects,
      total: filteredProjects.length,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

// Get project by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const project = projects.find(p => p.id === id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project' })
  }
})

// Create new project
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { name, description, budget, endDate } = req.body

    if (!name || !description || !budget || !endDate) {
      return res.status(400).json({ 
        message: 'Name, description, budget, and end date are required' 
      })
    }

    const newProject = {
      id: (projects.length + 1).toString(),
      name,
      description,
      status: 'active',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate,
      budget: Number(budget),
      revenue: 0,
      team: [],
      tasks: 0,
      completedTasks: 0,
    }

    projects.push(newProject)

    res.status(201).json(newProject)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project' })
  }
})

// Update project
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const projectIndex = projects.findIndex(p => p.id === id)

    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const updatedProject = { ...projects[projectIndex], ...req.body }
    projects[projectIndex] = updatedProject

    res.json(updatedProject)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' })
  }
})

// Delete project
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const projectIndex = projects.findIndex(p => p.id === id)

    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' })
    }

    projects.splice(projectIndex, 1)

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' })
  }
})

export default router
