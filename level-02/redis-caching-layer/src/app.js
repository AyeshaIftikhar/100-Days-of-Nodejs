const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const redisClient = require('./config/redis');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  redisClient.quit();
  process.exit(0);
});

module.exports = app;