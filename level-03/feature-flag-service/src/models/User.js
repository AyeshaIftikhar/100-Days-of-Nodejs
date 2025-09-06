const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  organizations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = mongoose.model('User', UserSchema);
