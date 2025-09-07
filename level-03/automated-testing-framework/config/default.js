'use strict';

/**
 * Default configuration for the Automated Testing Framework
 */
module.exports = {
  // Test configuration
  type: 'all', // 'api', 'ui', 'e2e', 'performance', 'all'
  pattern: '**/*.test.js',
  environment: 'dev',
  reporter: 'default',
  outputDir: 'reports',
  tags: [],
  headless: true,
  parallel: 1,
  timeout: 30000,
  coverage: false,
  
  // Browser configuration
  browser: {
    type: 'chromium', // 'chromium', 'firefox', 'webkit'
    width: 1280,
    height: 720,
    defaultTimeout: 10000,
    slowMo: 0,
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox']
  },
  
  // API configuration
  api: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    auth: null, // { username, password } for basic auth
    retries: 3
  },
  
  // Mock server configuration
  mockServer: {
    port: 3000,
    delay: 0,
    routes: [
      {
        path: '/api/users',
        method: 'GET',
        response: {
          status: 200,
          body: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ]
        }
      },
      {
        path: '/api/users/:id',
        method: 'GET',
        response: {
          status: 200,
          body: { id: 1, name: 'John Doe', email: 'john@example.com' }
        }
      }
    ]
  },
  
  // Screenshot configuration
  screenshots: {
    enabled: true,
    onFailure: true,
    path: 'screenshots',
    fullPage: true
  },
  
  // Reporting configuration
  reporting: {
    formats: ['default', 'html', 'junit'],
    includeConsoleOutput: true,
    includeScreenshots: true
  }
};
