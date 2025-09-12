const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const config = require('./config');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const dynamicApiRoutes = require('./routes/dynamicApiRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

// Mount routers
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/apis`, apiRoutes);
app.use(`${config.apiPrefix}`, dynamicApiRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Admin UI route
app.get(`${config.adminPrefix}*`, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
