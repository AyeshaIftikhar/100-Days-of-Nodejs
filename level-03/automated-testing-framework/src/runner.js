'use strict';

const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const logger = require('./logger');

/**
 * Run tests based on the provided configuration
 * @param {Object} config - Test run configuration
 * @returns {Promise<Object>} Test results summary
 */
async function runTests(config) {
  logger.debug('Running tests with config:', config);
  
  // Determine test path pattern based on test type
  let testPathPattern;
  switch(config.type) {
    case 'api':
      testPathPattern = 'tests/api';
      break;
    case 'ui':
      testPathPattern = 'tests/ui';
      break;
    case 'e2e':
      testPathPattern = 'tests/e2e';
      break;
    case 'performance':
      testPathPattern = 'tests/performance';
      break;
    case 'all':
    default:
      testPathPattern = 'tests';
      break;
  }
  
  // If pattern is provided, append it to the test path
  if (config.pattern) {
    testPathPattern = `${testPathPattern}/${config.pattern}`;
  }
  
  // Prepare Jest arguments
  const jestArgs = [
    '--testPathPattern', testPathPattern,
    '--runInBand'
  ];
  
  // Add parallel option if specified
  if (config.parallel > 1) {
    jestArgs.push('--maxWorkers', config.parallel.toString());
  }
  
  // Add timeout option if specified
  if (config.timeout) {
    jestArgs.push('--testTimeout', config.timeout.toString());
  }
  
  // Add reporter options
  if (config.reporter) {
    if (config.reporter.includes('html')) {
      jestArgs.push('--reporters', 'jest-html-reporter');
    }
    if (config.reporter.includes('junit')) {
      jestArgs.push('--reporters', 'jest-junit');
    }
  }
  
  // Add coverage option if specified
  if (config.coverage) {
    jestArgs.push('--coverage');
  }
  
  // Set environment variables for the test run
  const env = {
    ...process.env,
    NODE_ENV: config.environment,
    TEST_HEADLESS: config.headless.toString(),
    TEST_OUTPUT_DIR: config.outputDir
  };
  
  // Add tags as environment variable if specified
  if (config.tags && config.tags.length > 0) {
    env.TEST_TAGS = config.tags.join(',');
  }
  
  // Run Jest
  return new Promise((resolve, reject) => {
    logger.debug(`Running Jest with args: ${jestArgs.join(' ')}`);
    
    const jest = spawn('npx', ['jest', ...jestArgs], {
      env,
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    jest.stdout.on('data', (data) => {
      const dataStr = data.toString();
      output += dataStr;
      process.stdout.write(dataStr);
    });
    
    jest.stderr.on('data', (data) => {
      const dataStr = data.toString();
      errorOutput += dataStr;
      process.stderr.write(dataStr);
    });
    
    jest.on('close', (code) => {
      logger.debug(`Jest process exited with code ${code}`);
      
      // Parse results from output
      const results = parseTestResults(output);
      
      if (code !== 0 && !errorOutput.includes('failing')) {
        return reject(new Error(`Tests failed with error: ${errorOutput}`));
      }
      
      resolve(results);
    });
  });
}

/**
 * Parse test results from Jest output
 * @param {string} output - Jest command output
 * @returns {Object} Parsed test results
 */
function parseTestResults(output) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  // Extract test summary using regex
  const summaryMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  if (summaryMatch) {
    results.failed = parseInt(summaryMatch[1], 10);
    results.passed = parseInt(summaryMatch[2], 10);
    results.total = parseInt(summaryMatch[3], 10);
    results.skipped = results.total - results.passed - results.failed;
  }
  
  return results;
}

/**
 * Generate reports based on the provided configuration
 * @param {Object} config - Report generation configuration
 * @returns {Promise<number>} Number of reports generated
 */
async function generateReports(config) {
  logger.debug('Generating reports with config:', config);
  
  const { format, inputDir, outputDir } = config;
  let reportCount = 0;
  
  // Ensure directories exist
  await fs.ensureDir(outputDir);
  
  // Check if input directory exists
  if (!await fs.pathExists(inputDir)) {
    throw new Error(`Input directory "${inputDir}" does not exist`);
  }
  
  // Generate HTML report
  if (format.includes('html')) {
    const htmlReportPath = path.join(outputDir, 'test-report.html');
    
    // Check if junit.xml exists
    const junitPath = path.join(inputDir, 'junit.xml');
    if (await fs.pathExists(junitPath)) {
      // Use jest-junit to convert to HTML
      await new Promise((resolve, reject) => {
        const process = spawn('npx', [
          'jest-html-reporter',
          '--input', junitPath,
          '--output', htmlReportPath
        ], { stdio: 'inherit' });
        
        process.on('close', (code) => {
          if (code === 0) {
            reportCount++;
            resolve();
          } else {
            reject(new Error(`Failed to generate HTML report, exit code: ${code}`));
          }
        });
      });
    } else {
      logger.warn(`Could not find JUnit report at ${junitPath}`);
    }
  }
  
  // For other formats, simply copy the files
  if (format.includes('junit') || format.includes('xml')) {
    const junitSource = path.join(inputDir, 'junit.xml');
    const junitTarget = path.join(outputDir, 'junit.xml');
    
    if (await fs.pathExists(junitSource)) {
      await fs.copy(junitSource, junitTarget);
      reportCount++;
    }
  }
  
  if (format.includes('json')) {
    const jsonSource = path.join(inputDir, 'test-results.json');
    const jsonTarget = path.join(outputDir, 'test-results.json');
    
    if (await fs.pathExists(jsonSource)) {
      await fs.copy(jsonSource, jsonTarget);
      reportCount++;
    }
  }
  
  return reportCount;
}

module.exports = {
  runTests,
  generateReports
};
