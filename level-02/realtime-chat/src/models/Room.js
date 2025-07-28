const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true,
  },
  name: {
    type: String,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

roomSchema.index({ participants: 1, type: 1 });

module.exports = mongoose.model('Room', roomSchema);