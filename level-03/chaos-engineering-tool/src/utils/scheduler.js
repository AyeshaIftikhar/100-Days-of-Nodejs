const cron = require('node-cron');
const logger = require('./logger');
const { runScenario } = require('../chaos/scenario-runner');

const scheduledTasks = new Map();

/**
 * Setup scheduled chaos experiments
 * @param {Array} scenarios - Array of scenarios with schedule property
 */
function setupScheduler(scenarios) {
  if (!Array.isArray(scenarios)) {
    logger.error('Invalid scenarios format: expected array');
    return;
  }
  
  scenarios.forEach((scenario) => {
    if (!scenario.name || !scenario.schedule) {
      logger.warn('Skipping invalid scenario (missing name or schedule)');
      return;
    }
    
    // Validate cron expression
    if (!cron.validate(scenario.schedule)) {
      logger.error(`Invalid cron expression for scenario "${scenario.name}": ${scenario.schedule}`);
      return;
    }
    
    // Create cron job
    logger.info(`Scheduling scenario "${scenario.name}" with cron: ${scenario.schedule}`);
    
    const task = cron.schedule(scenario.schedule, () => {
      logger.info(`Running scheduled scenario: ${scenario.name}`);
      runScenario(scenario);
    }, {
      scheduled: true,
      timezone: scenario.timezone || 'UTC'
    });
    
    // Store the task for later reference
    scheduledTasks.set(scenario.name, task);
  });
  
  logger.info(`Successfully scheduled ${scheduledTasks.size} chaos experiments`);
}

/**
 * Get list of currently scheduled tasks
 */
function getScheduledTasks() {
  const tasks = [];
  
  for (const [name, task] of scheduledTasks.entries()) {
    tasks.push({
      name,
      schedule: task.options.schedule,
      timezone: task.options.timezone,
      active: task.options.scheduled
    });
  }
  
  return tasks;
}

/**
 * Stop a scheduled task
 * @param {string} name - Name of the scenario
 */
function stopTask(name) {
  const task = scheduledTasks.get(name);
  
  if (task) {
    task.stop();
    logger.info(`Stopped scheduled task: ${name}`);
    return true;
  } else {
    logger.warn(`Task not found: ${name}`);
    return false;
  }
}

/**
 * Stop all scheduled tasks
 */
function stopAllTasks() {
  for (const [name, task] of scheduledTasks.entries()) {
    task.stop();
    logger.info(`Stopped scheduled task: ${name}`);
  }
  
  logger.info(`Stopped ${scheduledTasks.size} scheduled tasks`);
}

module.exports = {
  setupScheduler,
  getScheduledTasks,
  stopTask,
  stopAllTasks
};
