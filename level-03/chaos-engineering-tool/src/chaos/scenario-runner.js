const logger = require('../utils/logger');

// Import chaos modules
const cpuStress = require('./cpu-stress');
const memoryStress = require('./memory-stress');
const networkChaos = require('./network-chaos');
const apiFailure = require('./api-failure');
const databaseChaos = require('./database-chaos');
const processChaos = require('./process-chaos');

/**
 * Run a single chaos scenario
 * @param {object} scenario - Scenario configuration object
 */
function runScenario(scenario) {
  logger.info(`Running scenario: ${scenario.name}`);
  
  if (!scenario.type) {
    logger.error('Scenario missing required "type" field');
    return;
  }
  
  try {
    switch (scenario.type) {
      case 'cpu':
        cpuStress.start(
          scenario.duration || 60,
          scenario.load || 80,
          scenario.safeMode !== false
        );
        break;
        
      case 'memory':
        memoryStress.start(
          scenario.duration || 60,
          scenario.load || 80,
          scenario.safeMode !== false
        );
        break;
        
      case 'network':
        networkChaos.start(scenario.action || 'latency', {
          target: scenario.target,
          delay: scenario.params?.delay || 100,
          rate: scenario.params?.rate || 10,
          duration: scenario.duration || 60
        });
        break;
        
      case 'api':
        apiFailure.start({
          target: scenario.target || 'http://localhost:8080',
          status: scenario.params?.status || 500,
          rate: scenario.params?.rate || 50,
          duration: scenario.duration || 60
        });
        break;
        
      case 'database':
        databaseChaos.start({
          target: scenario.target,
          action: scenario.action || 'connection-drop',
          duration: scenario.duration || 30,
          delay: scenario.params?.delay
        });
        break;
        
      case 'process':
        processChaos.start(scenario.action || 'kill', {
          target: scenario.target,
          random: scenario.random === true,
          exclude: scenario.exclude
        });
        break;
        
      default:
        logger.error(`Unknown scenario type: ${scenario.type}`);
    }
  } catch (err) {
    logger.error(`Error running scenario ${scenario.name}: ${err.message}`);
  }
}

/**
 * Run a list of chaos scenarios
 * @param {Array} scenarios - Array of scenario configuration objects
 */
function runScenarios(scenarios) {
  scenarios.forEach((scenario, index) => {
    const delay = index * 1000; // Stagger starts by 1 second
    
    setTimeout(() => {
      runScenario(scenario);
    }, delay);
  });
}

module.exports = { runScenario, runScenarios };
