const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Initialize users file if it doesn't exist
if (!fs.existsSync(config.USERS_FILE)) {
  fs.writeFileSync(config.USERS_FILE, JSON.stringify([], null, 2));
}

const users = JSON.parse(fs.readFileSync(config.USERS_FILE));

function saveUsers() {
  fs.writeFileSync(config.USERS_FILE, JSON.stringify(users, null, 2));
}

async function register(username, password) {
  // Check if user exists
  if (users.some(user => user.username === username)) {
    throw new Error('Username already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = {
    id: uuidv4(),
    username,
    password: hashedPassword,
    refreshToken: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers();

  return { id: newUser.id, username: newUser.username };
}

async function login(username, password) {
  const user = users.find(u => u.username === username);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    config.JWT_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY }
  );

  // Save refresh token
  user.refreshToken = refreshToken;
  saveUsers();

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username }
  };
}

function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, username: user.username },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

function getUserById(userId) {
  return users.find(user => user.id === userId);
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  getUserById
};