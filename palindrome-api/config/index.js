module.exports = {
  app: {
    port: process.env.PORT || 3000,
    apiPrefix: '/api/v1'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  palindrome: {
    ignoreSpaces: true,
    ignoreSpecialChars: true,
    caseSensitive: false
  }
};