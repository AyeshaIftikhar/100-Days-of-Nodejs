const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/auth');
const logger = require('../src/utils/logger');

module.exports = {
  async up() {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      logger.info('Admin user already exists');
      return;
    }

    // Create initial admin user
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      roles: ['admin', 'editor']
    });

    logger.info('Initial admin user created');
  },

  async down() {
    await User.deleteOne({ email: 'admin@example.com' });
    logger.info('Initial admin user removed');
  }
};