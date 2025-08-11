const Bull = require('bull');
const { QUEUE_NAME } = process.env;
const redisConfig = require('../config/redis');

const emailQueue = new Bull(QUEUE_NAME, {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  limiter: {
    max: 1000,
    duration: 5000
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

emailQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

emailQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

emailQueue.on('active', (job) => {
  console.log(`Job ${job.id} is now active`);
});

emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err);
});

module.exports = emailQueue;