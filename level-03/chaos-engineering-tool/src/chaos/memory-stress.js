const os = require('os');
const logger = require('../utils/logger');
const { monitorSystem } = require('../utils/monitor');

/**
 * Generate memory stress by allocating memory
 * @param {number} duration - Duration in seconds
 * @param {number} load - Memory usage percentage (1-100)
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

  // Calculate memory to allocate based on load percentage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const currentUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
  
  const targetUsage = load;
  const additionalMemoryPercentage = Math.max(0, targetUsage - currentUsage);
  const memoryToAllocate = Math.floor((additionalMemoryPercentage / 100) * totalMemory);
  
  logger.info(`Starting memory stress test targeting ${targetUsage}% usage`);
  logger.info(`Current memory usage: ${currentUsage.toFixed(2)}%`);
  logger.info(`Will allocate additional ${(memoryToAllocate / 1024 / 1024).toFixed(2)} MB`);
  logger.info(`Test will run for ${duration} seconds`);
  
  // Safety check
  if (safeMode && currentUsage > 85) {
    logger.warn(`System memory is already under heavy load (${currentUsage.toFixed(2)}%). Aborting for safety.`);
    logger.warn('Use --no-safe-mode to override this check');
    return;
  }
  
  // Setup monitoring
  const stopMonitoring = monitorSystem(5); // Monitor every 5 seconds
  
  // Allocate memory in chunks to avoid crashing the process
  const memoryChunks = [];
  const chunkSize = 10 * 1024 * 1024; // 10 MB chunks
  const numChunks = Math.floor(memoryToAllocate / chunkSize);
  
  try {
    for (let i = 0; i < numChunks; i++) {
      // Fill with random data to ensure it's not optimized away
      const chunk = Buffer.alloc(chunkSize, Math.random().toString());
      memoryChunks.push(chunk);
      
      // Log progress every 100 chunks (1 GB)
      if ((i + 1) % 100 === 0) {
        const allocatedSoFar = ((i + 1) * chunkSize) / 1024 / 1024;
        logger.debug(`Allocated ${allocatedSoFar.toFixed(2)} MB so far`);
      }
    }
    
    logger.info(`Memory allocation complete. Allocated ${(numChunks * chunkSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Set a timeout to release memory
    setTimeout(() => {
      releaseMemory();
    }, duration * 1000);
    
  } catch (err) {
    logger.error(`Error during memory allocation: ${err.message}`);
    releaseMemory();
  }
  
  // Handle premature termination
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping memory stress test');
    releaseMemory();
  });
  
  // Function to release allocated memory
  function releaseMemory() {
    logger.info('Releasing allocated memory');
    // Clear the array and force garbage collection if possible
    memoryChunks.length = 0;
    
    if (global.gc) {
      global.gc();
    } else {
      logger.info('Manual garbage collection not available. Run with --expose-gc for better cleanup');
    }
    
    stopMonitoring();
    logger.info('Memory stress test completed');
  }
}

module.exports = { start };
