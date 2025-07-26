const mongoose = require('mongoose');

const scrapedDataSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScrapeJob',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    required: true,
  },
  error: {
    type: String,
  },
  metrics: {
    responseTime: Number,
    pageSize: String,
  },
}, {
  timestamps: true,
});

// Index for faster querying
scrapedDataSchema.index({ jobId: 1, createdAt: -1 });

module.exports = mongoose.model('ScrapedData', scrapedDataSchema);