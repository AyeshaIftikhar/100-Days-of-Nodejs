#!/usr/bin/env node

const { program } = require('commander');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const { version } = require('../package.json');

// Load environment variables
dotenv.config();

// Import chaos modules
const cpuStress = require('./chaos/cpu-stress');
const memoryStress = require('./chaos/memory-stress');
const networkChaos = require('./chaos/network-chaos');
const apiFailure = require('./chaos/api-failure');
const databaseChaos = require('./chaos/database-chaos');
const processChaos = require('./chaos/process-chaos');
const configRunner = require('./chaos/config-runner');
const monitor = require('./utils/monitor');

// Main program
program
  .name('chaos-monkey')
  .description('A chaos engineering tool to test application resilience')
  .version(version);

// CPU stress command
program
  .command('stress')
  .description('Stress system resources')
  .argument('<resource>', 'Resource to stress (cpu, memory, disk)')
  .option('-d, --duration <seconds>', 'Duration in seconds', '60')
  .option('-l, --load <percentage>', 'Load percentage (1-100)', '80')
  .option('--safe-mode', 'Enable safe mode (prevent system crash)')
  .action((resource, options) => {
    logger.info(`Starting ${resource} stress test with ${options.load}% load for ${options.duration} seconds`);
    
    switch (resource) {
      case 'cpu':
        cpuStress.start(parseInt(options.duration), parseInt(options.load), options.safeMode);
        break;
      case 'memory':
        memoryStress.start(parseInt(options.duration), parseInt(options.load), options.safeMode);
        break;
      case 'disk':
        logger.info('Disk stress not implemented yet');
        break;
      default:
        logger.error(`Unknown resource: ${resource}`);
    }
  });

// Network chaos command
program
  .command('network')
  .description('Simulate network issues')
  .argument('<type>', 'Type of network issue (latency, loss, dns)')
  .option('-t, --target <host>', 'Target host')
  .option('-d, --delay <ms>', 'Delay in milliseconds (for latency)', '100')
  .option('-r, --rate <percentage>', 'Rate of packet loss (for loss)', '10')
  .option('--duration <seconds>', 'Duration in seconds', '60')
  .action((type, options) => {
    logger.info(`Starting network ${type} chaos for ${options.duration} seconds`);
    networkChaos.start(type, options);
  });

// API failure command
program
  .command('api-failure')
  .description('Simulate API failures')
  .option('-t, --target <url>', 'Target API URL', 'http://localhost:8080')
  .option('-s, --status <code>', 'HTTP status code to return', '500')
  .option('-r, --rate <percentage>', 'Percentage of requests to affect', '50')
  .option('-d, --duration <seconds>', 'Duration in seconds', '60')
  .action((options) => {
    logger.info(`Starting API failure simulation for ${options.target}`);
    apiFailure.start(options);
  });

// Database chaos command
program
  .command('database')
  .description('Simulate database issues')
  .option('-t, --target <connection>', 'Database connection string')
  .option('-a, --action <action>', 'Action (connection-drop, query-delay)', 'connection-drop')
  .option('-d, --duration <seconds>', 'Duration in seconds', '30')
  .action((options) => {
    logger.info(`Starting database chaos: ${options.action}`);
    databaseChaos.start(options);
  });

// Process chaos command
program
  .command('process')
  .description('Kill or restart processes')
  .argument('<action>', 'Action to take (kill, restart)')
  .option('-t, --target <process>', 'Target process name or ID')
  .option('-r, --random', 'Select a random process')
  .option('-e, --exclude <processes>', 'Comma-separated list of processes to exclude')
  .action((action, options) => {
    logger.info(`Starting process chaos: ${action}`);
    processChaos.start(action, options);
  });

// Run from config command
program
  .command('run')
  .description('Run predefined chaos scenarios from a config file')
  .option('-c, --config <path>', 'Path to config file', 'chaos-config.yaml')
  .option('--scenario <name>', 'Run a specific scenario from the config')
  .action((options) => {
    logger.info(`Running chaos scenarios from ${options.config}`);
    configRunner.start(options.config, options.scenario);
  });

// Monitor command
program
  .command('monitor')
  .description('Monitor system during chaos experiments')
  .option('-i, --interval <seconds>', 'Monitoring interval in seconds', '5')
  .option('-o, --output <file>', 'Output file for metrics')
  .action((options) => {
    logger.info('Starting system monitoring');
    monitor.start(options);
  });

// Error handling
program.exitOverride();
try {
  program.parse(process.argv);
} catch (err) {
  if (err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  
  logger.error('Error parsing command arguments:', err.message);
  process.exit(1);
}

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
