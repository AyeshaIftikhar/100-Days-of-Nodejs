const mongoose = require('mongoose');

const FeatureFlagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a flag name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  key: {
    type: String,
    required: [true, 'Please add a flag key'],
    trim: true,
    match: [/^[a-zA-Z0-9_\-\.]+$/, 'Key can only contain alphanumeric characters, underscores, hyphens, and periods'],
    index: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: String,
    weight: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  }],
  environments: [{
    name: {
      type: String,
      required: true,
      enum: ['development', 'staging', 'production'],
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    rules: [{
      attribute: String, // e.g., 'userId', 'country', 'userType'
      operator: {
        type: String,
        enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'in', 'notIn', 'startsWith', 'endsWith'],
      },
      values: [mongoose.Schema.Types.Mixed],
    }],
    defaultVariant: {
      type: String, // References a variant name
      required: true,
    },
    rolloutPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  }],
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for project and key to ensure uniqueness
FeatureFlagSchema.index({ project: 1, key: 1 }, { unique: true });

// Middleware to update 'updatedAt' timestamp before saving
FeatureFlagSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FeatureFlag', FeatureFlagSchema);
