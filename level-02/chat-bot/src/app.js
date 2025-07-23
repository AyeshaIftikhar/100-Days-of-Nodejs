const SlackBot = require('./bots/slack/slackBot');
const DiscordBot = require('./bots/discord/discordBot');
const connectDB = require('./services/dbService');

// Connect to database
connectDB();

// Start bots
const slackBot = new SlackBot();
const discordBot = new DiscordBot();

slackBot.start().catch(console.error);
discordBot.start().catch(console.error);

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down bots...');
  process.exit();
});