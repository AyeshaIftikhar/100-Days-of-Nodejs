const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const sampleRoutes = require('./routes/sample.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use('/api', sampleRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;