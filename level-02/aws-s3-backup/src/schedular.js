const cron = require('node-cron');
const BackupManager = require('./backup');
const logger = require('./utils/logger');
const config = require('./config');

const backupManager = new BackupManager();

logger.info('Starting backup scheduler...');

// Schedule backup job
cron.schedule(config.schedule, async () => {
  try {
    logger.info('Running scheduled backup...');
    await backupManager.createBackup();
    await backupManager.cleanupOldBackups();
    logger.info('Scheduled backup completed successfully');
  } catch (error) {
    logger.error(`Scheduled backup failed: ${error.message}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Stopping backup scheduler...');
  process.exit();
});

logger.info(`Backup scheduler running. Next backup will occur at the scheduled time: ${config.schedule}`);