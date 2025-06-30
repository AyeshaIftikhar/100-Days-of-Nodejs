module.exports = {
  JWT_SECRET: 'your-secret-key-here', // Change this in production!
  JWT_EXPIRES_IN: '15m',             // Access token expiry
  REFRESH_TOKEN_EXPIRY: '7d',        // Refresh token expiry
  USERS_FILE: './storage/users.json',
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5                    // Limit each IP to 5 requests per window
  }
};