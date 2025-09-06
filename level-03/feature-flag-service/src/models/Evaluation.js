const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  featureFlag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeatureFlag',
    required: true,
  },
  environment: {
    type: String,
    required: true,
    enum: ['development', 'staging', 'production'],
  },
  userId: {
    type: String,
    required: true,
  },
  context: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  result: {
    enabled: Boolean,
    variant: String,
    value: mongoose.Schema.Types.Mixed,
    reason: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for efficient querying
EvaluationSchema.index({ featureFlag: 1, environment: 1, timestamp: -1 });
EvaluationSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Evaluation', EvaluationSchema);
