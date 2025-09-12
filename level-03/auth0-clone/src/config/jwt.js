// JWT token configuration
module.exports = {
  secret: process.env.JWT_SECRET || 'auth0-clone-secret-key',
  accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  issuer: 'auth0-clone',
  audience: 'auth0-clone-api'
};
