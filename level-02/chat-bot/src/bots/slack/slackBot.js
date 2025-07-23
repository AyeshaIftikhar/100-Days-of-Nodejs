const { App } = require('@slack/bolt');
const config = require('../../config/slack');
const { registerSlackHandlers } = require('./slackHandlers');
const { registerCommands } = require('../common/commands');

class SlackBot {
  constructor() {
    this.app = new App({
      signingSecret: config.signingSecret,
      token: config.botToken,
      appToken: config.appToken,
      socketMode: true,
    });
  }

  async start() {
    registerSlackHandlers(this.app);
    registerCommands(this.app);
    
    await this.app.start(config.port);
    console.log(`Slack bot is running on port ${config.port}`);
  }
}

module.exports = SlackBot;