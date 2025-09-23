import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Routes
import authRoutes from './routes/auth';
import metricsRoutes from './routes/metrics';
import alertsRoutes from './routes/alerts';
import serversRoutes from './routes/servers';
import usersRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';

// Services
import { MetricsCollector } from './services/MetricsCollector';
import { AlertService } from './services/AlertService';
import { WebSocketService } from './services/WebSocketService';

dotenv.config();

class Server {
  private app: express.Application;
  private httpServer: any;
  private io: Server;
  private metricsCollector: MetricsCollector;
  private alertService: AlertService;
  private webSocketService: WebSocketService;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupServices();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true
    }));

    // Performance middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.API_RATE_WINDOW || '15') * 60 * 1000,
      max: parseInt(process.env.API_RATE_LIMIT || '100'),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/metrics', metricsRoutes);
    this.app.use('/api/alerts', alertsRoutes);
    this.app.use('/api/servers', serversRoutes);
    this.app.use('/api/users', usersRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
      });
    });

    // Error handling middleware
    this.app.use(errorHandler);
  }

  private setupServices(): void {
    // Initialize services
    this.webSocketService = new WebSocketService(this.io);
    this.metricsCollector = new MetricsCollector(this.webSocketService);
    this.alertService = new AlertService(this.webSocketService);

    // Start metrics collection
    this.metricsCollector.startCollection();
    
    // Start alert monitoring
    this.alertService.startMonitoring();
  }

  public async start(): Promise<void> {
    try {
      // Connect to databases
      await connectDatabase();
      await connectRedis();

      const port = process.env.PORT || 3001;
      
      this.httpServer.listen(port, () => {
        logger.info(`🚀 Server running on port ${port}`);
        logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🔗 WebSocket server ready for real-time monitoring`);
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getHttpServer(): any {
    return this.httpServer;
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = new Server();
server.start();

export default server;
