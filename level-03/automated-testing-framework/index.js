#!/usr/bin/env node
'use strict';

require('dotenv').config();
const { program } = require('commander');
const { version } = require('./package.json');
const cli = require('./src/cli');
const logger = require('./src/logger');

// Set up CLI
program
  .version(version)
  .description('Automated Testing Framework - A comprehensive solution for web application testing');

// Configure commands
program
  .command('run')
  .description('Run tests')
  .option('-t, --type <type>', 'Type of tests to run (api, ui, e2e, performance, all)', 'all')
  .option('-p, --pattern <pattern>', 'Test file pattern to match')
  .option('-e, --env <environment>', 'Environment to run tests against', 'dev')
  .option('-r, --reporter <reporter>', 'Reporter to use (default, html, junit)')
  .option('-o, --output <output>', 'Output directory for reports', 'reports')
  .option('-c, --config <config>', 'Path to config file')
  .option('--tags <tags>', 'Tags to filter tests by (comma separated)')
  .option('--headless', 'Run UI tests in headless mode', true)
  .option('--parallel <count>', 'Number of parallel test runners', '1')
  .option('--timeout <ms>', 'Test timeout in milliseconds', '30000')
  .action(cli.run);

program
  .command('report')
  .description('Generate test reports')
  .option('-f, --format <format>', 'Report format (html, junit, json)', 'html')
  .option('-i, --input <input>', 'Input directory containing test results', 'reports')
  .option('-o, --output <output>', 'Output directory for reports', 'reports')
  .action(cli.report);

program
  .command('mock')
  .description('Start mock server')
  .option('-p, --port <port>', 'Port to run the mock server on', '3000')
  .option('-d, --delay <ms>', 'Response delay in milliseconds', '0')
  .option('-c, --config <config>', 'Path to mock server config file')
  .action(cli.mock);

program
  .command('init')
  .description('Initialize a new test project')
  .option('-t, --template <template>', 'Template to use (basic, full)', 'basic')
  .option('-d, --directory <directory>', 'Directory to create the project in', '.')
  .action(cli.init);

// Error handling
program.on('command:*', () => {
  logger.error(`Invalid command: ${program.args.join(' ')}`);
  logger.info('See --help for a list of available commands.');
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
