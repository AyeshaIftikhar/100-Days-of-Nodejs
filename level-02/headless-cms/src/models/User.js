const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/auth');
const { ValidationError } = require('../utils/errors');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { type: String, required: true, select: false },
  roles: { type: [String], default: ['editor'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password hashing before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(new ValidationError('Password hashing failed'));
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);