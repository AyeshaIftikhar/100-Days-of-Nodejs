import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';
import { WebSocketServer } from 'ws';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import routes
import { registerRoutes } from './api/routes';
import { simulationController } from './api/controllers/simulationController';

// Import configuration
import { config } from './config';
import { setupWebSocketHandlers } from './api/ws';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blockchain Explorer API',
      version: '1.0.0',
      description: 'API for the Blockchain Explorer and Simulator',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Register API routes
registerRoutes(app);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Set up WebSocket handlers
setupWebSocketHandlers(wss);

// Start the server
server.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  console.log(`Swagger documentation available at http://localhost:${config.port}/api-docs`);
  
  // Start blockchain simulation if enabled
  if (config.simulation.enabled) {
    console.log('Starting blockchain simulation...');
    simulationController.startSimulation();
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
