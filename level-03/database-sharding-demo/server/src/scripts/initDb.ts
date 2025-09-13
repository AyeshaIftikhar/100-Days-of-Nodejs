import { User } from '../models/User';
import { Product } from '../models/Product';
import { Transaction } from '../models/Transaction';
import { ShardStatus } from '../models/ShardStatus';
import { generateRandomData } from '../utils/generators';
import mongoose from 'mongoose';

// This script initializes the database with sample data for testing
async function initializeDatabase() {
  try {
    console.log('Initializing database with sample data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});
    await ShardStatus.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create sample shard status data
    const shards = [
      {
        shardId: 'shard1rs',
        name: 'US Shard',
        host: 'shard1:27017',
        status: 'online',
        documentCount: 0,
        tags: ['us'],
        lastUpdated: new Date()
      },
      {
        shardId: 'shard2rs',
        name: 'EU Shard',
        host: 'shard2:27017',
        status: 'online',
        documentCount: 0,
        tags: ['eu'],
        lastUpdated: new Date()
      },
      {
        shardId: 'shard3rs',
        name: 'Asia Shard',
        host: 'shard3:27017',
        status: 'online',
        documentCount: 0,
        tags: ['asia'],
        lastUpdated: new Date()
      }
    ];
    
    await ShardStatus.insertMany(shards);
    console.log('Shard status data created');
    
    // Generate random sample data
    const users = generateRandomData(100, 'user');
    const products = generateRandomData(200, 'product');
    const transactions = generateRandomData(500, 'transaction');
    
    // Insert sample data
    await User.insertMany(users);
    console.log('User data created');
    
    await Product.insertMany(products);
    console.log('Product data created');
    
    await Transaction.insertMany(transactions);
    console.log('Transaction data created');
    
    // Update document counts in shard statuses
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    
    const totalDocs = userCount + productCount + transactionCount;
    const docsPerShard = Math.floor(totalDocs / 3);
    
    await ShardStatus.updateMany({}, { $set: { documentCount: docsPerShard } });
    
    console.log('Database initialization complete!');
    console.log(`Created ${userCount} users, ${productCount} products, and ${transactionCount} transactions`);
    
    return {
      userCount,
      productCount,
      transactionCount,
      shardCount: shards.length
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Export the function to be called from elsewhere
export { initializeDatabase };
