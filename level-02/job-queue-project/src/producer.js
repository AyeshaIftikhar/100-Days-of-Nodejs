const emailQueue = require('./queues/emailQueue');
const EmailJob = require('./jobs/emailJob');

async function addEmailJob(emailData) {
  try {
    const job = new EmailJob(emailData);
    const addedJob = await emailQueue.add(job.toJSON());
    
    console.log(`Added job ${addedJob.id} to the queue`);
    return addedJob;
  } catch (error) {
    console.error('Error adding job to queue:', error);
    throw error;
  }
}

// Example usage
if (require.main === module) {
  const sampleEmail = {
    to: 'user@example.com',
    subject: 'Welcome to our service',
    body: 'Thank you for signing up!'
  };
  
  addEmailJob(sampleEmail)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  addEmailJob
};