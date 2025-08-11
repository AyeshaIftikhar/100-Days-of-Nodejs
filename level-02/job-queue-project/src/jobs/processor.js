const EmailService = require('../services/emailService');

async function processEmailJob(job) {
  try {
    console.log(`Processing job ${job.id}`);
    console.log('Job data:', job.data);
    
    const result = await EmailService.sendEmail(job.data);
    
    console.log(`Job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error; // This will trigger the retry mechanism
  }
}

module.exports = {
  processEmailJob
};