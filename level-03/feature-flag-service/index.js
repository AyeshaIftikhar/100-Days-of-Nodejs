const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const config = require("./config");
const logger = require("./src/utils/logger");
const routes = require("./src/routes");
const errorMiddleware = require("./src/middleware/errorMiddleware");

// Initialize Express app
const app = express();

// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, "./swagger.yaml"));

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
); // HTTP request logging

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose
  .connect(config.db.uri)
  .then(() => {
    logger.info("Connected to MongoDB");

    // Start the server
    const server = app.listen(config.server.port, () => {
      logger.info(
        `Server running in ${config.server.env} mode on port ${config.server.port}`
      );
      console.log(
        `Server running in ${config.server.env} mode on port ${config.server.port}`
      );
      console.log('Running on http://localhost:' + config.server.port);
      console.log('Press CTRL+C to stop the server');
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Promise Rejection:", err);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app; // Export for testing
