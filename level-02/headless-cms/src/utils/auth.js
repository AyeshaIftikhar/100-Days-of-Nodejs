const bcrypt = require('bcryptjs');
const { ValidationError } = require('./errors');

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(candidate, hash) {
  return bcrypt.compare(candidate, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};