const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feed',
    required: true,
  },
  customTitle: {
    type: String,
  },
  category: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

subscriptionSchema.index({ user: 1, feed: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);