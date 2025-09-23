import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Import routes
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import projectRoutes from './routes/projects'
import analyticsRoutes from './routes/analytics'
import userRoutes from './routes/users'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { authenticateToken } from './middleware/auth'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})

const PORT = process.env.PORT || 3001

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api/', limiter)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', authenticateToken, dashboardRoutes)
app.use('/api/projects', authenticateToken, projectRoutes)
app.use('/api/analytics', authenticateToken, analyticsRoutes)
app.use('/api/users', authenticateToken, userRoutes)

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Business Analytics Dashboard API',
    version: '1.0.0',
    description: 'Comprehensive business analytics and performance tracking API',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      projects: '/api/projects',
      analytics: '/api/analytics',
      users: '/api/users',
    },
    documentation: '/api/docs',
  })
})

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`)

  socket.on('join-dashboard', (userId) => {
    socket.join(`user-${userId}`)
    logger.info(`User ${userId} joined dashboard room`)
  })

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`)
  })
})

// Store io instance for use in other modules
app.set('io', io)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
  })
})

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📊 Dashboard API available at http://localhost:${PORT}/api`)
  logger.info(`🔧 Health check at http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
  })
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export default app
