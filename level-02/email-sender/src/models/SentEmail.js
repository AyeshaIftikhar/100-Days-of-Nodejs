const mongoose = require('mongoose');

const sentEmailSchema = new mongoose.Schema({
  messageId: {
    type: String,
  },
  to: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
  context: {
    type: Object,
    default: {},
  },
  scheduled: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  error: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SentEmail', sentEmailSchema);