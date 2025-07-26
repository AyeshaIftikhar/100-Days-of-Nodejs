const cron = require('node-cron');
const ScrapeJob = require('../models/ScrapeJob');
const ScrapeJobs = require('./scrapeJobs');
const logger = require('../utils/logger');

class Scheduler {
  static async init() {
    // Load all active jobs from DB
    const jobs = await ScrapeJob.find({ active: true });
    
    jobs.forEach(job => {
      this.scheduleJob(job);
    });

    logger.info(`Scheduler initialized with ${jobs.length} active jobs`);
  }

  static scheduleJob(job) {
    if (!cron.validate(job.schedule)) {
      logger.error(`Invalid schedule for job ${job.name}: ${job.schedule}`);
      return;
    }

    const task = cron.schedule(job.schedule, async () => {
      try {
        logger.info(`Running scheduled job: ${job.name}`);
        
        // Update job run times
        job.lastRun = new Date();
        await job.save();

        // Execute the scrape job
        await ScrapeJobs.execute(job);

        // Calculate next run time
        const nextRun = task.nextDate();
        job.nextRun = nextRun.isValid() ? nextRun.toDate() : null;
        await job.save();
      } catch (error) {
        logger.error(`Error executing job ${job.name}: ${error.message}`);
      }
    });

    logger.info(`Scheduled job ${job.name} with pattern ${job.schedule}`);
  }
}

module.exports = Scheduler;