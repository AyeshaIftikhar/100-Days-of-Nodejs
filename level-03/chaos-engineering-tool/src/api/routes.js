const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import chaos modules
const cpuStress = require('../chaos/cpu-stress');
const memoryStress = require('../chaos/memory-stress');
const networkChaos = require('../chaos/network-chaos');
const apiFailure = require('../chaos/api-failure');
const databaseChaos = require('../chaos/database-chaos');
const processChaos = require('../chaos/process-chaos');
const configRunner = require('../chaos/config-runner');
const { runScenario } = require('../chaos/scenario-runner');
const { getScheduledTasks, stopTask, stopAllTasks } = require('../utils/scheduler');
const { collectMetrics } = require('../utils/monitor');

// API routes

// Get available chaos types
router.get('/chaos', (req, res) => {
  res.json({
    availableTypes: [
      'cpu-stress',
      'memory-stress',
      'network-chaos',
      'api-failure',
      'database-chaos',
      'process-chaos'
    ],
    documentation: '/api/docs'
  });
});

// Get system metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await collectMetrics();
    res.json({
      timestamp: new Date().toISOString(),
      metrics
    });
  } catch (err) {
    logger.error(`Error collecting metrics: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// CPU stress
router.post('/chaos/cpu-stress', (req, res) => {
  const duration = parseInt(req.body.duration) || 60;
  const load = parseInt(req.body.load) || 80;
  const safeMode = req.body.safeMode !== false;
  
  logger.info(`API request: CPU stress (${load}% for ${duration}s)`);
  
  // Validate parameters
  if (duration > 300) {
    return res.status(400).json({
      error: 'Duration too long',
      message: 'Maximum duration is 300 seconds (5 minutes)'
    });
  }
  
  // Start CPU stress
  try {
    cpuStress.start(duration, load, safeMode);
    res.json({
      message: 'CPU stress started',
      duration,
      load,
      safeMode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Memory stress
router.post('/chaos/memory-stress', (req, res) => {
  const duration = parseInt(req.body.duration) || 60;
  const load = parseInt(req.body.load) || 80;
  const safeMode = req.body.safeMode !== false;
  
  logger.info(`API request: Memory stress (${load}% for ${duration}s)`);
  
  // Validate parameters
  if (duration > 300) {
    return res.status(400).json({
      error: 'Duration too long',
      message: 'Maximum duration is 300 seconds (5 minutes)'
    });
  }
  
  // Start memory stress
  try {
    memoryStress.start(duration, load, safeMode);
    res.json({
      message: 'Memory stress started',
      duration,
      load,
      safeMode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Network chaos
router.post('/chaos/network-chaos', (req, res) => {
  const type = req.body.type || 'latency';
  const options = {
    target: req.body.target,
    delay: parseInt(req.body.delay) || 100,
    rate: parseInt(req.body.rate) || 10,
    duration: parseInt(req.body.duration) || 60
  };
  
  logger.info(`API request: Network chaos (${type})`);
  
  // Validate parameters
  if (options.duration > 300) {
    return res.status(400).json({
      error: 'Duration too long',
      message: 'Maximum duration is 300 seconds (5 minutes)'
    });
  }
  
  if (!['latency', 'loss', 'dns'].includes(type)) {
    return res.status(400).json({
      error: 'Invalid network chaos type',
      message: 'Type must be one of: latency, loss, dns'
    });
  }
  
  // Start network chaos
  try {
    networkChaos.start(type, options);
    res.json({
      message: 'Network chaos started',
      type,
      options
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API failure
router.post('/chaos/api-failure', (req, res) => {
  const options = {
    target: req.body.target || 'http://localhost:8080',
    status: parseInt(req.body.status) || 500,
    rate: parseInt(req.body.rate) || 50,
    duration: parseInt(req.body.duration) || 60
  };
  
  logger.info(`API request: API failure (${options.status} at ${options.rate}%)`);
  
  // Validate parameters
  if (options.duration > 300) {
    return res.status(400).json({
      error: 'Duration too long',
      message: 'Maximum duration is 300 seconds (5 minutes)'
    });
  }
  
  // Start API failure simulation
  try {
    apiFailure.start(options);
    res.json({
      message: 'API failure simulation started',
      options
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database chaos
router.post('/chaos/database-chaos', (req, res) => {
  const options = {
    target: req.body.target,
    action: req.body.action || 'connection-drop',
    duration: parseInt(req.body.duration) || 30,
    delay: parseInt(req.body.delay) || 1000
  };
  
  logger.info(`API request: Database chaos (${options.action})`);
  
  // Validate parameters
  if (options.duration > 300) {
    return res.status(400).json({
      error: 'Duration too long',
      message: 'Maximum duration is 300 seconds (5 minutes)'
    });
  }
  
  if (!options.target) {
    return res.status(400).json({
      error: 'Missing target',
      message: 'Database target connection string is required'
    });
  }
  
  // Start database chaos
  try {
    databaseChaos.start(options);
    res.json({
      message: 'Database chaos started',
      options
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process chaos
router.post('/chaos/process-chaos', (req, res) => {
  const action = req.body.action || 'kill';
  const options = {
    target: req.body.target,
    random: req.body.random === true,
    exclude: req.body.exclude
  };
  
  logger.info(`API request: Process chaos (${action})`);
  
  // Validate parameters
  if (!options.target && !options.random) {
    return res.status(400).json({
      error: 'Missing target',
      message: 'Either target process or random flag is required'
    });
  }
  
  if (!['kill', 'restart'].includes(action)) {
    return res.status(400).json({
      error: 'Invalid action',
      message: 'Action must be either "kill" or "restart"'
    });
  }
  
  // Start process chaos
  try {
    processChaos.start(action, options);
    res.json({
      message: 'Process chaos started',
      action,
      options
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run scenario from config
router.post('/chaos/scenario', (req, res) => {
  const scenario = req.body;
  
  if (!scenario || !scenario.name || !scenario.type) {
    return res.status(400).json({
      error: 'Invalid scenario',
      message: 'Scenario must have at least name and type properties'
    });
  }
  
  logger.info(`API request: Run scenario (${scenario.name})`);
  
  // Run the scenario
  try {
    runScenario(scenario);
    res.json({
      message: 'Scenario started',
      scenario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scheduled tasks
router.get('/scheduler', (req, res) => {
  const tasks = getScheduledTasks();
  
  res.json({
    scheduledTasks: tasks,
    count: tasks.length
  });
});

// Stop a scheduled task
router.delete('/scheduler/:name', (req, res) => {
  const name = req.params.name;
  
  logger.info(`API request: Stop scheduled task (${name})`);
  
  const success = stopTask(name);
  
  if (success) {
    res.json({
      message: `Scheduled task "${name}" stopped`
    });
  } else {
    res.status(404).json({
      error: 'Task not found',
      message: `No scheduled task found with name "${name}"`
    });
  }
});

// Stop all scheduled tasks
router.delete('/scheduler', (req, res) => {
  logger.info('API request: Stop all scheduled tasks');
  
  stopAllTasks();
  
  res.json({
    message: 'All scheduled tasks stopped'
  });
});

module.exports = router;
