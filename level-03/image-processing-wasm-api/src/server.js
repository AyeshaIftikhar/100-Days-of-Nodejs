const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
require('dotenv').config();

// Import services and middleware
const { logger, requestLogger } = require('./services/loggerService');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const imageRoutes = require('./routes/imageRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');

// Create Express application
const app = express();

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-eval'"], // needed for WebAssembly
      "worker-src": ["'self'", "blob:"]
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Use our custom request logger
app.use(limiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Set up Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing WASM API',
      version: '1.0.0',
      description: 'A WebAssembly-powered API for high-performance image processing',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/images', imageRoutes);
app.use('/api/benchmark', benchmarkRoutes);

// Simple home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  
  // Log environment info
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Node.js version: ${process.version}`);
});

module.exports = app;
