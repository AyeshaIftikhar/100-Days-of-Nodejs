'use strict';

const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const logger = require('../../src/logger');

/**
 * Test utilities
 */
const testUtils = {
  /**
   * Sleep for a specified time
   * @param {number} ms - Time to sleep in milliseconds
   * @returns {Promise<void>}
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Generate a random string
   * @param {number} length - Length of the string
   * @returns {string} Random string
   */
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },
  
  /**
   * Generate a random email
   * @returns {string} Random email
   */
  randomEmail: () => {
    const username = testUtils.randomString(8).toLowerCase();
    const domain = testUtils.randomString(6).toLowerCase();
    return `${username}@${domain}.com`;
  },
  
  /**
   * Generate a random number between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  randomNumber: (min = 1, max = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  /**
   * Pick a random item from an array
   * @param {Array} array - Array to pick from
   * @returns {*} Random item
   */
  randomItem: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },
  
  /**
   * Check if a port is in use
   * @param {number} port - Port to check
   * @returns {Promise<boolean>} Whether port is in use
   */
  isPortInUse: async (port) => {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await exec(`netstat -ano | findstr :${port}`);
        return stdout.trim().length > 0;
      } else {
        const { stdout } = await exec(`lsof -i:${port}`);
        return stdout.trim().length > 0;
      }
    } catch (error) {
      // If the command fails, the port is not in use
      return false;
    }
  },
  
  /**
   * Find an available port
   * @param {number} startPort - Port to start checking from
   * @returns {Promise<number>} Available port
   */
  findAvailablePort: async (startPort = 3000) => {
    let port = startPort;
    
    while (await testUtils.isPortInUse(port)) {
      port++;
    }
    
    return port;
  },
  
  /**
   * Load test data from a file
   * @param {string} fileName - Data file name
   * @returns {Promise<Object>} Test data
   */
  loadTestData: async (fileName) => {
    const dataPath = path.resolve(process.cwd(), 'tests', 'data', fileName);
    
    try {
      const data = await fs.readFile(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to load test data from ${dataPath}:`, error);
      throw error;
    }
  },
  
  /**
   * Format a date for test output
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate: (date = new Date()) => {
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  },
  
  /**
   * Calculate test duration
   * @param {number} startTime - Start time in milliseconds
   * @param {number} endTime - End time in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration: (startTime, endTime) => {
    const duration = endTime - startTime;
    
    if (duration < 1000) {
      return `${duration}ms`;
    }
    
    return `${(duration / 1000).toFixed(2)}s`;
  }
};

module.exports = testUtils;
