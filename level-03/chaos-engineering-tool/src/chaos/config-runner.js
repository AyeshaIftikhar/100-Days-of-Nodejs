const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const logger = require('../utils/logger');
const { setupScheduler } = require('../utils/scheduler');
const { runScenario, runScenarios } = require('./scenario-runner');

/**
 * Run chaos experiments from a config file
 * @param {string} configPath - Path to the config file
 * @param {string} scenarioName - Optional specific scenario to run
 */
function start(configPath, scenarioName) {
  logger.info(`Loading chaos config from ${configPath}`);
  
  try {
    // Check if the config file exists
    if (!fs.existsSync(configPath)) {
      logger.error(`Config file not found: ${configPath}`);
      return;
    }
    
    // Read and parse the config file
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const config = parseConfig(fileContent, path.extname(configPath));
    
    if (!config || !config.scenarios || !Array.isArray(config.scenarios)) {
      logger.error('Invalid config format: missing or invalid scenarios array');
      return;
    }
    
    // Filter scenarios if a specific one is requested
    const scenarios = scenarioName 
      ? config.scenarios.filter(s => s.name === scenarioName)
      : config.scenarios;
    
    if (scenarioName && scenarios.length === 0) {
      logger.error(`Scenario not found: ${scenarioName}`);
      return;
    }
    
    logger.info(`Found ${scenarios.length} scenario(s) to run`);
    
    // Check if any scenarios are scheduled
    const scheduledScenarios = scenarios.filter(s => s.schedule);
    const immediateScenarios = scenarios.filter(s => !s.schedule);
    
    // Setup scheduled scenarios
    if (scheduledScenarios.length > 0) {
      logger.info(`Setting up ${scheduledScenarios.length} scheduled scenario(s)`);
      setupScheduler(scheduledScenarios);
    }
    
    // Run immediate scenarios
    if (immediateScenarios.length > 0) {
      logger.info(`Running ${immediateScenarios.length} immediate scenario(s)`);
      runScenarios(immediateScenarios);
    }
  } catch (err) {
    logger.error(`Error running chaos scenarios: ${err.message}`);
  }
}

/**
 * Parse config file based on extension
 */
function parseConfig(content, extension) {
  if (extension === '.yaml' || extension === '.yml') {
    return YAML.parse(content);
  } else if (extension === '.json') {
    return JSON.parse(content);
  } else {
    // Try to guess format
    try {
      return JSON.parse(content);
    } catch (e) {
      try {
        return YAML.parse(content);
      } catch (e) {
        throw new Error('Unsupported config format. Use .yaml, .yml, or .json');
      }
    }
  }
}

// The runScenarios and runScenario functions have been moved to scenario-runner.js

module.exports = { start };
