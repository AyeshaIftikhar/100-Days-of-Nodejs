const { spawn, exec } = require('child_process');
const os = require('os');
const logger = require('../utils/logger');

/**
 * Simulate network issues
 * @param {string} type - Type of network issue (latency, loss, dns)
 * @param {object} options - Configuration options
 */
function start(type, options) {
  const platform = os.platform();
  const duration = parseInt(options.duration) || 60;
  const target = options.target || '';
  
  logger.info(`Starting network chaos: ${type}`);
  
  // Check if running as root (required for some network operations)
  if (process.getuid && process.getuid() !== 0) {
    logger.warn('Some network chaos operations require root privileges');
    logger.warn('You may need to run this command with sudo');
  }
  
  let command = '';
  let cleanupCommand = '';
  
  // Build the appropriate command based on platform and chaos type
  switch (type) {
    case 'latency':
      if (platform === 'linux') {
        const delay = parseInt(options.delay) || 100;
        // Use tc (traffic control) on Linux
        command = `tc qdisc add dev eth0 root netem delay ${delay}ms`;
        cleanupCommand = 'tc qdisc del dev eth0 root';
      } else if (platform === 'darwin') {
        // For macOS, use pfctl/dnctl if available
        const delay = parseInt(options.delay) || 100;
        logger.warn('Network latency on macOS requires manual configuration with pfctl/dnctl');
        logger.info('Simulating latency with sleep-based proxy instead');
        
        // Start a simple proxy that adds delay
        command = `node -e "
          const http = require('http');
          const httpProxy = require('http-proxy');
          const proxy = httpProxy.createProxyServer({});
          
          const server = http.createServer(function(req, res) {
            setTimeout(() => {
              proxy.web(req, res, { target: '${target}' });
            }, ${delay});
          });
          
          server.listen(8080);
          console.log('Proxy with ${delay}ms delay started on port 8080');
          
          setTimeout(() => {
            server.close();
            console.log('Proxy stopped after ${duration} seconds');
            process.exit(0);
          }, ${duration * 1000});
        "`;
        
        cleanupCommand = 'lsof -ti:8080 | xargs kill -9';
      } else {
        logger.error(`Network latency chaos not supported on ${platform}`);
        return;
      }
      break;
      
    case 'loss':
      if (platform === 'linux') {
        const rate = parseInt(options.rate) || 10;
        // Use tc (traffic control) on Linux
        command = `tc qdisc add dev eth0 root netem loss ${rate}%`;
        cleanupCommand = 'tc qdisc del dev eth0 root';
      } else {
        logger.error(`Network packet loss chaos not supported on ${platform}`);
        return;
      }
      break;
      
    case 'dns':
      // DNS failures can be simulated by modifying /etc/hosts
      if (target) {
        command = `echo "127.0.0.1 ${target}" | sudo tee -a /etc/hosts`;
        cleanupCommand = `sudo sed -i '/${target}/d' /etc/hosts`;
      } else {
        logger.error('Target host is required for DNS chaos');
        return;
      }
      break;
      
    default:
      logger.error(`Unknown network chaos type: ${type}`);
      return;
  }
  
  // Execute the chaos command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Failed to start network chaos: ${error.message}`);
      logger.error(`Command: ${command}`);
      return;
    }
    
    if (stdout) logger.debug(`Command output: ${stdout}`);
    if (stderr) logger.warn(`Command error: ${stderr}`);
    
    logger.info(`Network ${type} chaos started for ${duration} seconds`);
    
    // Set timeout to cleanup
    setTimeout(() => {
      cleanup();
    }, duration * 1000);
  });
  
  // Handle premature termination
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping network chaos');
    cleanup();
  });
  
  // Function to clean up network changes
  function cleanup() {
    exec(cleanupCommand, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Failed to clean up network chaos: ${error.message}`);
        logger.error(`Cleanup command: ${cleanupCommand}`);
        logger.error('You may need to manually restore network settings');
        return;
      }
      
      if (stdout) logger.debug(`Cleanup output: ${stdout}`);
      if (stderr) logger.warn(`Cleanup error: ${stderr}`);
      
      logger.info(`Network ${type} chaos stopped`);
    });
  }
}

module.exports = { start };
