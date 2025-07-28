const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rateLimit: {
    type: Number,
    default: 100,
  },
  rateLimitWindow: {
    type: Number,
    default: 60,
  },
  scopes: {
    type: [String],
    default: ['read'],
  },
  expiresAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

apiKeySchema.index({ key: 1 }, { unique: true });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ApiKey', apiKeySchema);