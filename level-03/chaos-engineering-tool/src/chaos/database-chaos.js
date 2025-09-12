const net = require('net');
const logger = require('../utils/logger');
const { URL } = require('url');

let proxyServer = null;

/**
 * Simulate database issues
 * @param {object} options - Configuration options
 */
function start(options) {
  const target = options.target || 'mongodb://localhost:27017';
  const action = options.action || 'connection-drop';
  const duration = parseInt(options.duration) || 30;
  
  logger.info(`Starting database chaos: ${action}`);
  logger.info(`Target: ${target}`);
  logger.info(`Duration: ${duration}s`);
  
  try {
    // Parse the database connection string
    const parsedUrl = new URL(target);
    const dbHost = parsedUrl.hostname;
    const dbPort = parseInt(parsedUrl.port) || getDefaultPortForProtocol(parsedUrl.protocol);
    
    switch (action) {
      case 'connection-drop':
        simulateConnectionDrop(dbHost, dbPort, duration);
        break;
        
      case 'query-delay':
        simulateQueryDelay(dbHost, dbPort, duration, options.delay || 1000);
        break;
        
      default:
        logger.error(`Unknown database chaos action: ${action}`);
        return;
    }
  } catch (err) {
    logger.error(`Failed to parse database connection string: ${err.message}`);
  }
}

/**
 * Simulate database connection drops
 */
function simulateConnectionDrop(dbHost, dbPort, duration) {
  // Create a proxy that randomly drops connections
  const proxyPort = dbPort + 1;
  
  proxyServer = net.createServer((socket) => {
    // 50% chance of dropping the connection immediately
    if (Math.random() < 0.5) {
      logger.debug('Simulating connection drop');
      socket.end();
      return;
    }
    
    logger.debug('Proxying connection to database');
    const dbSocket = net.connect({
      host: dbHost,
      port: dbPort
    });
    
    // Pipe data between client and database
    socket.pipe(dbSocket);
    dbSocket.pipe(socket);
    
    // Handle errors
    socket.on('error', (err) => {
      logger.debug(`Client socket error: ${err.message}`);
    });
    
    dbSocket.on('error', (err) => {
      logger.debug(`Database socket error: ${err.message}`);
    });
  });
  
  proxyServer.listen(proxyPort, () => {
    logger.info(`Database chaos proxy started on port ${proxyPort}`);
    logger.info(`Connect to localhost:${proxyPort} instead of ${dbHost}:${dbPort}`);
  });
  
  // Set timeout to stop the proxy
  setTimeout(() => {
    stop();
  }, duration * 1000);
  
  // Handle premature termination
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping database chaos');
    stop();
  });
}

/**
 * Simulate query delays
 */
function simulateQueryDelay(dbHost, dbPort, duration, delay) {
  // Create a proxy that adds delay to queries
  const proxyPort = dbPort + 1;
  
  proxyServer = net.createServer((socket) => {
    logger.debug('New database connection received');
    
    const dbSocket = net.connect({
      host: dbHost,
      port: dbPort
    });
    
    // Add delay to data sent to the database
    socket.on('data', (data) => {
      logger.debug(`Adding ${delay}ms delay to database query`);
      setTimeout(() => {
        if (dbSocket.writable) {
          dbSocket.write(data);
        }
      }, delay);
    });
    
    // No delay for responses from the database
    dbSocket.on('data', (data) => {
      if (socket.writable) {
        socket.write(data);
      }
    });
    
    // Handle errors
    socket.on('error', (err) => {
      logger.debug(`Client socket error: ${err.message}`);
    });
    
    dbSocket.on('error', (err) => {
      logger.debug(`Database socket error: ${err.message}`);
    });
    
    // Handle connection close
    socket.on('close', () => {
      dbSocket.end();
    });
    
    dbSocket.on('close', () => {
      socket.end();
    });
  });
  
  proxyServer.listen(proxyPort, () => {
    logger.info(`Database delay proxy started on port ${proxyPort}`);
    logger.info(`Connect to localhost:${proxyPort} instead of ${dbHost}:${dbPort}`);
    logger.info(`Adding ${delay}ms delay to all queries`);
  });
  
  // Set timeout to stop the proxy
  setTimeout(() => {
    stop();
  }, duration * 1000);
  
  // Handle premature termination
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping database chaos');
    stop();
  });
}

/**
 * Stop database chaos
 */
function stop() {
  if (proxyServer) {
    proxyServer.close(() => {
      logger.info('Database chaos proxy stopped');
    });
    proxyServer = null;
  }
}

/**
 * Get default port for database protocol
 */
function getDefaultPortForProtocol(protocol) {
  switch (protocol.replace(':', '')) {
    case 'mongodb': return 27017;
    case 'mysql': return 3306;
    case 'postgresql': 
    case 'postgres': return 5432;
    case 'redis': return 6379;
    default: return 27017;
  }
}

module.exports = { start, stop };
