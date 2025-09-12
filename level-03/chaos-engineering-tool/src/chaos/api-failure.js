const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');
const logger = require('../utils/logger');

let proxyServer = null;
let apiServer = null;

/**
 * Simulate API failures by intercepting requests
 * @param {object} options - Configuration options
 */
function start(options) {
  const targetUrl = options.target || 'http://localhost:8080';
  const statusCode = parseInt(options.status) || 500;
  const rate = parseInt(options.rate) || 50;
  const duration = parseInt(options.duration) || 60;
  
  logger.info(`Starting API failure simulation for ${targetUrl}`);
  logger.info(`Status code: ${statusCode}, Failure rate: ${rate}%, Duration: ${duration}s`);
  
  // Parse the target URL
  const parsedUrl = url.parse(targetUrl);
  const proxyPort = 8081;
  const proxyPath = parsedUrl.path || '/';
  
  // Create a proxy server
  const proxy = httpProxy.createProxyServer({});
  
  // Setup the API mock server
  const app = express();
  
  // Middleware to simulate failures
  app.use((req, res, next) => {
    // Determine if this request should fail based on rate
    if (Math.random() * 100 < rate) {
      logger.debug(`Simulating API failure with status ${statusCode}`);
      res.status(statusCode).json({
        error: 'Simulated API failure',
        code: statusCode,
        message: 'This is a simulated failure injected by Chaos Monkey'
      });
    } else {
      logger.debug('Proxying request to target API');
      proxy.web(req, res, { target: targetUrl }, (err) => {
        if (err) {
          logger.error(`Proxy error: ${err.message}`);
          res.status(502).json({
            error: 'Proxy error',
            message: err.message
          });
        }
      });
    }
  });
  
  // Start the proxy server
  apiServer = app.listen(proxyPort, () => {
    logger.info(`API failure proxy started on port ${proxyPort}`);
    logger.info(`Proxying requests to ${targetUrl}`);
    logger.info(`Use http://localhost:${proxyPort}${proxyPath} instead of the original API`);
  });
  
  // Set timeout to stop the servers
  setTimeout(() => {
    stop();
  }, duration * 1000);
  
  // Handle premature termination
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping API failure simulation');
    stop();
  });
}

/**
 * Stop API failure simulation
 */
function stop() {
  if (apiServer) {
    apiServer.close(() => {
      logger.info('API failure proxy server stopped');
    });
    apiServer = null;
  }
  
  if (proxyServer) {
    proxyServer.close(() => {
      logger.info('Proxy server stopped');
    });
    proxyServer = null;
  }
}

module.exports = { start, stop };
