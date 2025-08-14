const { Client, Intents, GatewayIntentBits } = require("discord.js");
const config = require("../../config/discord");
const { registerDiscordHandlers } = require("./discordHandlers");
const { registerCommands } = require("../common/commands");

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds],
      // intents: [
      //   Intents.FLAGS.GUILDS,
      //   Intents.FLAGS.GUILD_MESSAGES,
      //   Intents.FLAGS.DIRECT_MESSAGES
      // ]
    });
  }

  async start() {
    registerDiscordHandlers(this.client);
    registerCommands(this.client);

    await this.client.login(config.token);
    console.log(`Discord bot logged in as ${this.client.user.tag}`);
  }
}

module.exports = DiscordBot;
