const User = require('../models/User');
const connectDB = require('../config/db');

// Function to create an admin user if none exists
const seedAdminUser = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Create admin user
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    process.exit();
  } catch (error) {
    console.error(`Error seeding admin user: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedAdminUser();
