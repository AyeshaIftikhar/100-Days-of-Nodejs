require('dotenv').config();
const express = require('express');
const { addEmailJob } = require('./producer');
const { startConsumer } = require('./consumer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API endpoint to add email jobs
app.post('/api/emails', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const job = await addEmailJob({ to, subject, body });
    res.status(201).json({ 
      message: 'Email job added to queue',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add email job' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start the consumer
startConsumer().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Redis connected to ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
});