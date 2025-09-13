import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { config } from './config';

// Import routes
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import transactionRoutes from './routes/transactionRoutes';
import shardRoutes from './routes/shardRoutes';

// Initialize express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/shards', shardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// MongoDB connection with retry mechanism
async function connectToMongoDB(retries = 5, delay = 5000) {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectToMongoDB(retries - 1, delay), delay);
    } else {
      console.error('Maximum retries reached. Could not connect to MongoDB.');
      process.exit(1);
    }
  }
}

// Start the server after connecting to MongoDB
async function startServer() {
  try {
    await connectToMongoDB();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

// Export app for testing
export { app, startServer };
