const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtConfig = require('../config/jwt');
const User = require('../models/user.model');

// Generate JWT access token
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    roles: user.roles,
    tenantId: user.tenantId,
    isAdmin: user.roles.some(role => role.name === 'admin')
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessTokenExpiration,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });
};

// Generate refresh token
const generateRefreshToken = async (user) => {
  // Create a refresh token with UUID
  const refreshToken = crypto.randomUUID();
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setTime(
    expiresAt.getTime() + 
    (7 * 24 * 60 * 60 * 1000) // 7 days by default
  );

  // Store refresh token with user
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: refreshToken,
        expiresAt: expiresAt
      }
    }
  });

  return {
    token: refreshToken,
    expiresAt: expiresAt
  };
};

// Verify refresh token and generate new access token
const refreshTokens = async (refreshToken) => {
  // Find user with this refresh token
  const user = await User.findOne({
    'refreshTokens.token': refreshToken,
    'refreshTokens.expiresAt': { $gt: new Date() }
  });

  if (!user) {
    throw new Error('Invalid or expired refresh token');
  }

  // Generate new access token
  const accessToken = generateAccessToken(user);

  return {
    accessToken
  };
};

// Revoke refresh token
const revokeRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, {
    $pull: {
      refreshTokens: { token: refreshToken }
    }
  });
};

// Revoke all refresh tokens (log out from all devices)
const revokeAllRefreshTokens = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    refreshTokens: []
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshTokens,
  revokeRefreshToken,
  revokeAllRefreshTokens
};
