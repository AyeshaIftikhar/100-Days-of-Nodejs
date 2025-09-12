const { spawn } = require('child_process');
const os = require('os');
const logger = require('../utils/logger');
const { monitorSystem } = require('../utils/monitor');

/**
 * Generate CPU stress by spawning worker processes
 * @param {number} duration - Duration in seconds
 * @param {number} load - CPU load percentage (1-100)
 * @param {boolean} safeMode - Enable safe mode to prevent system crash
 */
function start(duration = 60, load = 80, safeMode = true) {
  // Validate parameters
  if (isNaN(duration) || duration <= 0) {
    logger.error('Duration must be a positive number');
    return;
  }

  if (isNaN(load) || load < 1 || load > 100) {
    logger.error('Load must be a number between 1 and 100');
    return;
  }

  // Calculate number of cores to use based on load percentage
  const numCores = os.cpus().length;
  const coresToUse = Math.max(1, Math.floor((numCores * load) / 100));
  
  logger.info(`Starting CPU stress test with ${coresToUse} out of ${numCores} cores at ~${load}% load`);
  logger.info(`Test will run for ${duration} seconds`);
  
  // Safety check
  if (safeMode) {
    const currentLoad = os.loadavg()[0] / numCores * 100;
    if (currentLoad > 70) {
      logger.warn(`System is already under heavy load (${currentLoad.toFixed(2)}%). Aborting for safety.`);
      logger.warn('Use --no-safe-mode to override this check');
      return;
    }
  }
  
  // Setup monitoring
  const stopMonitoring = monitorSystem(5); // Monitor every 5 seconds
  
  // Start worker processes to generate CPU load
  const workers = [];
  
  for (let i = 0; i < coresToUse; i++) {
    const worker = spawn('node', ['-e', `
      // CPU stress worker
      console.log('CPU stress worker ${i + 1} started');
      const endTime = Date.now() + ${duration * 1000};
      while (Date.now() < endTime) {
        // Busy wait to consume CPU
        for (let j = 0; j < 1000000; j++) {
          Math.sqrt(Math.random() * 10000);
        }
      }
      console.log('CPU stress worker ${i + 1} finished');
    `]);
    
    workers.push(worker);
    
    worker.stdout.on('data', (data) => {
      logger.debug(`Worker ${i + 1}: ${data.toString().trim()}`);
    });
    
    worker.stderr.on('data', (data) => {
      logger.error(`Worker ${i + 1} error: ${data.toString().trim()}`);
    });
  }
  
  logger.info(`Started ${coresToUse} CPU stress workers`);
  
  // Set a timeout to stop the test
  setTimeout(() => {
    logger.info('CPU stress test completed');
    stopAllWorkers();
    stopMonitoring();
  }, duration * 1000);
  
  // Handle premature termination
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping CPU stress test');
    stopAllWorkers();
    stopMonitoring();
  });
  
  // Function to stop all worker processes
  function stopAllWorkers() {
    workers.forEach((worker, index) => {
      if (!worker.killed) {
        worker.kill();
        logger.debug(`Stopped worker ${index + 1}`);
      }
    });
    logger.info('All CPU stress workers stopped');
  }
}

module.exports = { start };
