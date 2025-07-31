const mongoose = require('mongoose');

const feedItemSchema = new mongoose.Schema({
  feed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feed',
    required: true,
  },
  guid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  content: {
    type: String,
  },
  link: {
    type: String,
    required: true,
  },
  pubDate: {
    type: Date,
    required: true,
  },
  author: {
    type: String,
  },
  categories: [{
    type: String,
  }],
  enclosure: {
    url: String,
    type: String,
    length: Number,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

feedItemSchema.index({ feed: 1, guid: 1 }, { unique: true });
feedItemSchema.index({ feed: 1, pubDate: -1 });

module.exports = mongoose.model('FeedItem', feedItemSchema);