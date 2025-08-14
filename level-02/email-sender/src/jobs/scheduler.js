const cron = require('node-cron');
const EmailJob = require('./emailJobs');
const logger = require('../utils/logger');

class Scheduler {
  static init() {
    // Scheduled job to send pending emails every minute
    cron.schedule('* * * * *', async () => {
      try {
        logger.info('Running scheduled email job');
        await EmailJob.processScheduledEmails();
      } catch (error) {
        logger.error('Scheduled job failed:', error);
      }
    });

    // Daily cleanup job at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('Running daily cleanup job');
        await EmailJob.cleanupOldRecords();
      } catch (error) {
        logger.error('Cleanup job failed:', error);
      }
    });

    logger.info('Email scheduler initialized');
  }
}

module.exports = Scheduler;