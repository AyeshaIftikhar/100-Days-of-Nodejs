const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const logger = require('../utils/logger');

// Default config path
const DEFAULT_CONFIG_PATH = path.join(process.cwd(), 'chaos-config.yaml');

/**
 * Load configuration from file
 * @param {string} configPath - Path to config file (optional)
 */
function loadConfig(configPath = DEFAULT_CONFIG_PATH) {
  try {
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      logger.warn(`Config file not found: ${configPath}`);
      logger.info('Using default configuration');
      return getDefaultConfig();
    }
    
    // Read and parse config file
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const extension = path.extname(configPath).toLowerCase();
    
    let config;
    if (extension === '.yaml' || extension === '.yml') {
      config = YAML.parse(fileContent);
    } else if (extension === '.json') {
      config = JSON.parse(fileContent);
    } else {
      logger.warn(`Unknown config file extension: ${extension}`);
      logger.warn('Attempting to parse as YAML...');
      try {
        config = YAML.parse(fileContent);
      } catch (err) {
        logger.warn('YAML parsing failed, attempting JSON...');
        config = JSON.parse(fileContent);
      }
    }
    
    // Validate config
    if (!config || typeof config !== 'object') {
      logger.error('Invalid config format');
      return getDefaultConfig();
    }
    
    logger.info('Configuration loaded successfully');
    return config;
  } catch (err) {
    logger.error(`Error loading config: ${err.message}`);
    return getDefaultConfig();
  }
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    safeMode: true,
    logLevel: 'info',
    scheduledExperiments: []
  };
}

/**
 * Save configuration to file
 * @param {object} config - Configuration object
 * @param {string} configPath - Path to save config (optional)
 */
function saveConfig(config, configPath = DEFAULT_CONFIG_PATH) {
  try {
    const extension = path.extname(configPath).toLowerCase();
    let fileContent;
    
    if (extension === '.yaml' || extension === '.yml') {
      fileContent = YAML.stringify(config);
    } else if (extension === '.json') {
      fileContent = JSON.stringify(config, null, 2);
    } else {
      logger.warn(`Unknown config file extension: ${extension}`);
      logger.warn('Saving as YAML...');
      fileContent = YAML.stringify(config);
    }
    
    // Create directory if it doesn't exist
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write config to file
    fs.writeFileSync(configPath, fileContent);
    logger.info(`Configuration saved to ${configPath}`);
    
    return true;
  } catch (err) {
    logger.error(`Error saving config: ${err.message}`);
    return false;
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  getDefaultConfig
};
