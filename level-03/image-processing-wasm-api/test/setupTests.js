// This file runs before Jest tests
const path = require('path');
const fs = require('fs');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use a different port for tests

// Create required directories
const uploadDir = path.join(__dirname, '../uploads');
const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Global teardown
afterAll(async () => {
  // Clean up test files
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  if (fs.existsSync(testImagePath)) {
    try {
      fs.unlinkSync(testImagePath);
    } catch (error) {
      console.error('Could not delete test image:', error);
    }
  }
});
