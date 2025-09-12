require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/low-code-api',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  apiPrefix: '/api/v1',
  adminPrefix: '/admin',
};
