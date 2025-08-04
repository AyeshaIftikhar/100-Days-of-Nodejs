const mongoose = require('mongoose');
const logger = require('../utils/logger');

const testScenarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  environment: {
    type: String,
    required: true,
    enum: ['dev', 'staging', 'prod']
  },
  status: {
    type: String,
    required: true,
    enum: ['queued', 'running', 'completed', 'failed']
  },
  reportFile: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  metrics: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Post-save hook to log test completion
testScenarioSchema.post('save', function(doc) {
  if (doc.status === 'completed') {
    logger.info(`Test scenario ${doc.name} completed for ${doc.environment} environment`);
  }
});

const TestScenario = mongoose.model('TestScenario', testScenarioSchema);

module.exports = TestScenario;