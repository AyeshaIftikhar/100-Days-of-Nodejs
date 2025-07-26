const mongoose = require('mongoose');

const scrapeJobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['ecommerce', 'news', 'generic'],
  },
  selectors: {
    type: Object,
    required: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastRun: {
    type: Date,
  },
  nextRun: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ScrapeJob', scrapeJobSchema);