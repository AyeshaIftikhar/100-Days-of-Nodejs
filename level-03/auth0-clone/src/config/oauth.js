// Configuration for OAuth providers
module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/social/google/callback',
    scope: ['profile', 'email']
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/social/github/callback',
    scope: ['user:email']
  },
  // Add more providers as needed
};
