const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  link: {
    type: String,
  },
  language: {
    type: String,
  },
  lastFetched: {
    type: Date,
  },
  lastModified: {
    type: String,
  },
  etag: {
    type: String,
  },
  image: {
    url: String,
    title: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

feedSchema.index({ url: 1 }, { unique: true });

module.exports = mongoose.model('Feed', feedSchema);