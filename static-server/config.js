const path = require('path');

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  
  // Static files configuration
  PUBLIC_DIR: path.join(__dirname, 'public'),
  INDEX_FILES: ['index.html', 'index.htm'],
  CACHE_CONTROL: 'public, max-age=3600', // 1 hour cache
  
  // Directory listing configuration
  SHOW_DIRECTORY: true,
  DIRECTORY_TEMPLATE: path.join(__dirname, 'views/directory.html'),
  
  // Security
  CORS_ENABLED: true,
  SECURITY_HEADERS: true
};