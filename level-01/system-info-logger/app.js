const SystemInfo = require('./system-info');
const Logger = require('./logger');
const config = require('./config');

const logger = new Logger(config);

function monitorSystem() {
  const info = SystemInfo.getAllInfo(config);
  logger.log(info);
  
  setTimeout(monitorSystem, config.interval * 1000);
}

console.log('Starting system monitoring...');
console.log(`Logging interval: ${config.interval} seconds`);
console.log('Press Ctrl+C to stop\n');

monitorSystem();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping system monitoring...');
  process.exit();
});