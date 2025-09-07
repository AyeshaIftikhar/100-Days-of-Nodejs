'use strict';

const logger = require('./logger');
const runner = require('./runner');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Run tests based on provided options
 * @param {Object} options - Command options
 */
async function run(options) {
  logger.info(chalk.blue('Starting test execution...'));
  logger.debug('Options:', options);

  try {
    // Load configuration
    const config = options.config ? 
      require(path.resolve(process.cwd(), options.config)) : 
      require('../config/default');
    
    // Override config with command line options
    const runConfig = {
      ...config,
      type: options.type || config.type,
      pattern: options.pattern || config.pattern,
      environment: options.env || config.environment,
      reporter: options.reporter || config.reporter,
      outputDir: options.output || config.outputDir,
      tags: options.tags ? options.tags.split(',') : config.tags,
      headless: options.headless !== undefined ? options.headless : config.headless,
      parallel: parseInt(options.parallel || config.parallel, 10),
      timeout: parseInt(options.timeout || config.timeout, 10)
    };

    // Run tests
    const results = await runner.runTests(runConfig);
    
    // Show summary
    logger.info(chalk.green(`Test execution completed!`));
    logger.info(`Total: ${results.total}, Passed: ${chalk.green(results.passed)}, Failed: ${chalk.red(results.failed)}, Skipped: ${chalk.yellow(results.skipped)}`);
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Error running tests:', error);
    process.exit(1);
  }
}

/**
 * Generate reports based on provided options
 * @param {Object} options - Command options
 */
async function report(options) {
  logger.info(chalk.blue('Generating test reports...'));
  logger.debug('Options:', options);

  try {
    const inputDir = path.resolve(process.cwd(), options.input);
    const outputDir = path.resolve(process.cwd(), options.output);
    
    // Ensure output directory exists
    await fs.ensureDir(outputDir);
    
    // Generate reports
    const reportCount = await runner.generateReports({
      format: options.format,
      inputDir,
      outputDir
    });
    
    logger.info(chalk.green(`Generated ${reportCount} reports in ${outputDir}`));
  } catch (error) {
    logger.error('Error generating reports:', error);
    process.exit(1);
  }
}

/**
 * Start mock server based on provided options
 * @param {Object} options - Command options
 */
async function mock(options) {
  logger.info(chalk.blue('Starting mock server...'));
  logger.debug('Options:', options);

  try {
    const mockServer = require('../lib/mock-server');
    const config = options.config ? 
      require(path.resolve(process.cwd(), options.config)) : 
      {};
    
    await mockServer.start({
      port: options.port,
      delay: options.delay,
      ...config
    });
    
    logger.info(chalk.green(`Mock server running at http://localhost:${options.port}`));
    logger.info('Press CTRL+C to stop');
  } catch (error) {
    logger.error('Error starting mock server:', error);
    process.exit(1);
  }
}

/**
 * Initialize a new test project
 * @param {Object} options - Command options
 */
async function init(options) {
  logger.info(chalk.blue('Initializing new test project...'));
  logger.debug('Options:', options);

  try {
    const templateDir = path.resolve(__dirname, '../examples', options.template);
    const targetDir = path.resolve(process.cwd(), options.directory);
    
    // Check if template exists
    if (!await fs.pathExists(templateDir)) {
      logger.error(`Template '${options.template}' not found`);
      process.exit(1);
    }
    
    // Create directory if it doesn't exist
    await fs.ensureDir(targetDir);
    
    // Copy template files
    await fs.copy(templateDir, targetDir, {
      overwrite: false,
      errorOnExist: false
    });
    
    logger.info(chalk.green(`Project initialized in ${targetDir}`));
    logger.info(`Next steps:
1. cd ${options.directory !== '.' ? options.directory : ''}
2. npm install
3. npm test`);
  } catch (error) {
    logger.error('Error initializing project:', error);
    process.exit(1);
  }
}

module.exports = {
  run,
  report,
  mock,
  init
};
