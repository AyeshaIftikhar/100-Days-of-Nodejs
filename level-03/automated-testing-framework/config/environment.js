'use strict';

const defaultConfig = require('./default');

/**
 * Environment-specific configurations
 */
const environments = {
  dev: {
    ...defaultConfig,
    api: {
      ...defaultConfig.api,
      baseUrl: process.env.DEV_BASE_URL || 'http://localhost:3000'
    }
  },
  
  test: {
    ...defaultConfig,
    api: {
      ...defaultConfig.api,
      baseUrl: process.env.TEST_BASE_URL || 'http://test-api.example.com'
    }
  },
  
  staging: {
    ...defaultConfig,
    api: {
      ...defaultConfig.api,
      baseUrl: process.env.STAGING_BASE_URL || 'https://staging-api.example.com'
    },
    browser: {
      ...defaultConfig.browser,
      slowMo: 50 // Slow down browser operations for better stability
    }
  },
  
  production: {
    ...defaultConfig,
    api: {
      ...defaultConfig.api,
      baseUrl: process.env.PROD_BASE_URL || 'https://api.example.com',
      timeout: 10000 // Longer timeout for production
    },
    screenshots: {
      ...defaultConfig.screenshots,
      fullPage: false // Save resources in production
    },
    reporting: {
      ...defaultConfig.reporting,
      includeConsoleOutput: false
    }
  }
};

/**
 * Get configuration for a specific environment
 * @param {string} env - Environment name
 * @returns {Object} Environment configuration
 */
function getEnvironmentConfig(env) {
  if (!environments[env]) {
    throw new Error(`Unknown environment: ${env}`);
  }
  return environments[env];
}

module.exports = {
  environments,
  getEnvironmentConfig
};
