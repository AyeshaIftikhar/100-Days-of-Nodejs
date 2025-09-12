const os = require('os');
const fs = require('fs');
const path = require('path');
const si = require('systeminformation');
const logger = require('./logger');

let monitorInterval = null;
let metricsData = [];

/**
 * Start monitoring system metrics
 * @param {object} options - Monitoring options
 */
function start(options) {
  const interval = parseInt(options.interval) || 5;
  const outputFile = options.output;
  
  logger.info(`Starting system monitoring every ${interval} seconds`);
  if (outputFile) {
    logger.info(`Metrics will be saved to ${outputFile}`);
  }
  
  // Initialize metrics array
  metricsData = [];
  
  // Start monitoring loop
  monitorInterval = setInterval(async () => {
    try {
      const metrics = await collectMetrics();
      logMetrics(metrics);
      
      // Store metrics for later analysis
      metricsData.push({
        timestamp: new Date().toISOString(),
        ...metrics
      });
      
      // Save to file if requested
      if (outputFile) {
        saveMetrics(outputFile);
      }
    } catch (err) {
      logger.error(`Error collecting metrics: ${err.message}`);
    }
  }, interval * 1000);
  
  // Return function to stop monitoring
  return () => {
    stop(outputFile);
  };
}

/**
 * Stop monitoring and save final results
 */
function stop(outputFile) {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    logger.info('System monitoring stopped');
    
    if (outputFile && metricsData.length > 0) {
      saveMetrics(outputFile);
    }
  }
}

/**
 * Monitor system for a single collection
 */
async function monitorSystem(interval = 5) {
  if (monitorInterval) {
    logger.warn('Monitoring already in progress');
    return () => {};
  }
  
  return start({ interval });
}

/**
 * Collect system metrics
 */
async function collectMetrics() {
  const cpuLoad = await si.currentLoad();
  const memInfo = await si.mem();
  const fsStats = await si.fsStats();
  const networkStats = await si.networkStats();
  
  return {
    cpu: {
      load: cpuLoad.currentLoad.toFixed(2),
      loadUser: cpuLoad.currentLoadUser.toFixed(2),
      loadSystem: cpuLoad.currentLoadSystem.toFixed(2),
      processes: os.cpus().length
    },
    memory: {
      total: (memInfo.total / 1024 / 1024 / 1024).toFixed(2),
      used: (memInfo.used / 1024 / 1024 / 1024).toFixed(2),
      usedPercent: ((memInfo.used / memInfo.total) * 100).toFixed(2)
    },
    disk: {
      reads: fsStats.rx,
      writes: fsStats.wx,
      ioTime: fsStats.tIO
    },
    network: {
      rxBytes: networkStats.reduce((sum, iface) => sum + iface.rx_bytes, 0),
      txBytes: networkStats.reduce((sum, iface) => sum + iface.tx_bytes, 0),
      rxErrors: networkStats.reduce((sum, iface) => sum + iface.rx_errors, 0),
      txErrors: networkStats.reduce((sum, iface) => sum + iface.tx_errors, 0)
    },
    system: {
      uptime: os.uptime(),
      loadAvg: os.loadavg()
    }
  };
}

/**
 * Log current metrics
 */
function logMetrics(metrics) {
  logger.info('System Metrics:');
  logger.info(`  CPU Load: ${metrics.cpu.load}% (User: ${metrics.cpu.loadUser}%, System: ${metrics.cpu.loadSystem}%)`);
  logger.info(`  Memory: ${metrics.memory.used}GB / ${metrics.memory.total}GB (${metrics.memory.usedPercent}%)`);
  logger.info(`  Network: RX: ${formatBytes(metrics.network.rxBytes)}, TX: ${formatBytes(metrics.network.txBytes)}`);
  logger.info(`  Load Average: ${metrics.system.loadAvg.map(l => l.toFixed(2)).join(', ')}`);
}

/**
 * Save metrics to file
 */
function saveMetrics(outputFile) {
  try {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(metricsData, null, 2));
    logger.debug(`Metrics saved to ${outputFile}`);
  } catch (err) {
    logger.error(`Error saving metrics: ${err.message}`);
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

module.exports = { start, stop, monitorSystem, collectMetrics };
