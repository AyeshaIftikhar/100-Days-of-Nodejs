// Mongoose model for scraped data
const mongoose = require('mongoose');

const ScrapedDataSchema = new mongoose.Schema({
  source: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  scrapedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScrapedData', ScrapedDataSchema);
