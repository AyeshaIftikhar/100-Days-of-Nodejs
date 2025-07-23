const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_URL}${process.env.GOOGLE_CALLBACK_URL}`
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_URL}${process.env.GITHUB_CALLBACK_URL}`
  }
};