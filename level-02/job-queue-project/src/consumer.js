const emailQueue = require('./queues/emailQueue');
const { processEmailJob } = require('./jobs/processor');

async function startConsumer() {
  console.log('Starting email queue consumer...');
  
  emailQueue.process(async (job) => {
    return await processEmailJob(job);
  });
}

// Start the consumer if this file is run directly
if (require.main === module) {
  startConsumer().catch(console.error);
}

module.exports = {
  startConsumer
};