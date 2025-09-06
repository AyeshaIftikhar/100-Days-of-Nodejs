const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  thumbnailPath: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: false
  },
  size: {
    type: Number,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  qualities: [{
    name: String,
    path: String,
    resolution: String,
    bitrate: String
  }],
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  analytics: {
    totalWatchTime: {
      type: Number,
      default: 0
    },
    averageViewDuration: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
});

// Increment views
VideoSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Add watch time analytics
VideoSchema.methods.addWatchTime = async function(watchTime) {
  this.analytics.totalWatchTime += watchTime;
  
  // Recalculate average view duration
  if (this.views > 0) {
    this.analytics.averageViewDuration = this.analytics.totalWatchTime / this.views;
  }
  
  // Calculate completion rate (percentage of views that watched at least 90% of the video)
  if (watchTime >= this.duration * 0.9) {
    this.analytics.completionRate = ((this.analytics.completionRate * (this.views - 1)) + 1) / this.views;
  } else {
    this.analytics.completionRate = ((this.analytics.completionRate * (this.views - 1)) + 0) / this.views;
  }
  
  await this.save();
};

module.exports = mongoose.model('Video', VideoSchema);
