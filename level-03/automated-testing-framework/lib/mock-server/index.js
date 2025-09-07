'use strict';

const express = require('express');
const logger = require('../../src/logger');
const defaultConfig = require('../../config/default');

/**
 * Mock server for API testing
 */
class MockServer {
  /**
   * Create a new mock server
   * @param {Object} config - Server configuration
   */
  constructor(config = {}) {
    this.config = {
      ...defaultConfig.mockServer,
      ...config
    };
    
    this.app = express();
    this.server = null;
    
    // Setup middleware
    this.setupMiddleware();
    
    // Add default routes
    this.setupRoutes();
  }
  
  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Add JSON body parser
    this.app.use(express.json());
    
    // Add request logger
    this.app.use((req, res, next) => {
      logger.debug(`Mock Server: ${req.method} ${req.url}`);
      next();
    });
    
    // Add response delay if configured
    if (this.config.delay > 0) {
      this.app.use((req, res, next) => {
        setTimeout(next, this.config.delay);
      });
    }
  }
  
  /**
   * Setup routes from configuration
   */
  setupRoutes() {
    if (!this.config.routes || !this.config.routes.length) {
      return;
    }
    
    this.config.routes.forEach(route => {
      const { path, method, response } = route;
      
      if (!path || !method || !response) {
        logger.warn('Invalid route configuration:', route);
        return;
      }
      
      const methodFn = method.toLowerCase();
      
      if (!this.app[methodFn]) {
        logger.warn(`Invalid HTTP method: ${method}`);
        return;
      }
      
      this.app[methodFn](path, (req, res) => {
        // Handle dynamic responses
        let responseBody = typeof response.body === 'function' 
          ? response.body(req) 
          : response.body;
          
        // Handle path parameters
        if (typeof responseBody === 'object' && req.params) {
          const paramsKeys = Object.keys(req.params);
          
          if (paramsKeys.length && Array.isArray(responseBody)) {
            // If it's an array, find the matching item
            const paramId = parseInt(req.params.id, 10);
            if (!isNaN(paramId)) {
              responseBody = responseBody.find(item => item.id === paramId) || responseBody;
            }
          }
        }
        
        // Set status code and send response
        res.status(response.status || 200).json(responseBody);
      });
      
      logger.debug(`Registered route: ${method.toUpperCase()} ${path}`);
    });
    
    // Add catch-all route
    this.app.all('*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }
  
  /**
   * Add a new route
   * @param {string} path - Route path
   * @param {string} method - HTTP method
   * @param {Object} response - Response configuration
   */
  addRoute(path, method, response) {
    this.config.routes = this.config.routes || [];
    this.config.routes.push({ path, method, response });
    
    // Reset routes
    this.app._router = null;
    this.setupMiddleware();
    this.setupRoutes();
    
    logger.debug(`Added route: ${method.toUpperCase()} ${path}`);
  }
  
  /**
   * Start the server
   * @param {Object} options - Start options
   * @returns {Promise<void>}
   */
  async start(options = {}) {
    const config = {
      ...this.config,
      ...options
    };
    
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(config.port, () => {
          logger.info(`Mock server started on port ${config.port}`);
          resolve();
        });
      } catch (error) {
        logger.error('Failed to start mock server:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Stop the server
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.server) {
      return;
    }
    
    return new Promise((resolve) => {
      this.server.close(() => {
        logger.info('Mock server stopped');
        this.server = null;
        resolve();
      });
    });
  }
}

// Create default mock server instance
const mockServer = new MockServer();

module.exports = {
  MockServer,
  mockServer
};
