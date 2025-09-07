# Automated Testing Framework

A comprehensive, modular and extensible automated testing framework for web applications. This framework supports API testing, UI testing, end-to-end testing, and performance testing with built-in reporting capabilities.

## Features

- **Multi-level Testing**: API, UI, E2E, and performance testing support
- **Modular Architecture**: Easily extendable for different testing needs
- **Reporting**: Comprehensive test reports in multiple formats (HTML, XML)
- **CI/CD Integration**: Ready to integrate with CI/CD pipelines
- **Parallel Test Execution**: Run tests in parallel for faster results
- **Screenshot Capture**: Automatic screenshot capture on test failures
- **Configurable**: Easily configure for different environments
- **Custom Assertions**: Custom matchers for specific testing scenarios
- **Mock Server**: Built-in mock server for API testing
- **Command Line Interface**: Easy to use CLI for running tests

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd automated-testing-framework
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (copy from example):
```bash
cp .env.example .env
```

## Usage

### Running Tests

Run all tests:
```bash
npm test
```

Run specific test types:
```bash
npm run test:api    # Run API tests
npm run test:ui     # Run UI tests
npm run test:e2e    # Run end-to-end tests
npm run test:performance # Run performance tests
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

### CLI Options

The framework provides a CLI for more granular control:

```bash
node index.js --help
node index.js run --type api --tags critical,regression
node index.js report --format html
```

## Project Structure

```
automated-testing-framework/
├── config/                  # Configuration files
│   ├── default.js           # Default configuration
│   └── environment.js       # Environment-specific configurations
├── lib/                     # Core library code
│   ├── api/                 # API testing utilities
│   ├── ui/                  # UI testing utilities
│   ├── e2e/                 # End-to-end testing utilities
│   ├── performance/         # Performance testing utilities
│   ├── reporters/           # Custom reporters
│   ├── utils/               # Utility functions
│   └── mock-server/         # Mock server for API testing
├── src/                     # Source code for the framework
│   ├── cli.js               # Command line interface
│   ├── logger.js            # Logging functionality
│   └── runner.js            # Test runner
├── tests/                   # Test files
│   ├── api/                 # API tests
│   ├── ui/                  # UI tests
│   ├── e2e/                 # End-to-end tests
│   └── performance/         # Performance tests
├── examples/                # Example test files
├── reports/                 # Test reports (generated)
├── .env.example             # Example environment variables
├── .eslintrc.js             # ESLint configuration
├── index.js                 # Main entry point
└── package.json             # Project metadata and dependencies
```

## Creating Tests

### API Test Example

```javascript
// tests/api/users.test.js
const { apiTest } = require('../../lib/api');

describe('User API', () => {
  test('should get user by ID', async () => {
    const response = await apiTest.get('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('name');
  });

  test('should create a new user', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const response = await apiTest.post('/api/users', userData);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });
});
```

### UI Test Example

```javascript
// tests/ui/login.test.js
const { uiTest } = require('../../lib/ui');

describe('Login Page', () => {
  beforeAll(async () => {
    await uiTest.navigate('https://example.com/login');
  });

  test('should display error for invalid credentials', async () => {
    await uiTest.type('#username', 'invalid');
    await uiTest.type('#password', 'wrong');
    await uiTest.click('#login-button');
    
    const errorMessage = await uiTest.getText('.error-message');
    expect(errorMessage).toContain('Invalid credentials');
  });

  afterAll(async () => {
    await uiTest.close();
  });
});
```

## Configuration

The framework can be configured using environment variables or configuration files. Create a `.env` file based on `.env.example`:

```
BASE_URL=https://api.example.com
BROWSER=chrome
HEADLESS=true
TIMEOUT=30000
RETRY_COUNT=3
SCREENSHOT_DIR=./screenshots
REPORT_FORMAT=html,junit
LOG_LEVEL=info
```

## Extending the Framework

The framework is designed to be extensible. You can add custom test types, reporters, or utilities:

1. Create a new module in the appropriate directory
2. Export your module functionality
3. Import and use in your tests

Example of extending with custom matcher:

```javascript
// lib/utils/custom-matchers.js
const customMatchers = {
  toBeValidEmail: (received) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      pass,
      message: () => 
        `Expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
    };
  },
};

module.exports = customMatchers;

// In your test file:
const customMatchers = require('../../lib/utils/custom-matchers');

beforeEach(() => {
  expect.extend(customMatchers);
});

test('validates email format', () => {
  expect('test@example.com').toBeValidEmail();
});
```

## CI/CD Integration

The framework can be easily integrated with CI/CD pipelines. Here's an example for GitHub Actions:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Upload test reports
      uses: actions/upload-artifact@v3
      with:
        name: test-reports
        path: reports/
```

## Future Enhancements

- **Visual Regression Testing**: Add capability to detect visual changes
- **AI-Powered Test Generation**: Implement ML for automatic test generation
- **Cross-Browser Testing**: Extend support for multiple browsers using Selenium Grid
- **Mobile Testing Integration**: Add Appium integration for mobile testing
- **Load Testing**: Integrate with k6 for load testing
- **Test Data Generation**: Add faker.js for generating test data
- **Dashboard**: Web-based dashboard for test results visualization
- **Plugin System**: Support for plugins to extend functionality
- **Accessibility Testing**: Integration with axe-core for accessibility testing
- **Test Prioritization**: Smart test execution based on code changes

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
