require('dotenv').config();

module.exports = {
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  botToken: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
};