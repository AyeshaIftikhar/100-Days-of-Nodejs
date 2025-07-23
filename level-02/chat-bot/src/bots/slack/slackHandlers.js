const { handleGreeting, handleHelp, handleWeather } = require('../common/commands');

const registerSlackHandlers = (app) => {
  // Event handlers
  app.event('app_mention', async ({ event, say }) => {
    await handleGreeting(event.text, say);
  });

  // Command handlers
  app.command('/weather', async ({ command, ack, say }) => {
    await ack();
    await handleWeather(command.text, say);
  });

  app.command('/help', async ({ command, ack, say }) => {
    await ack();
    await handleHelp(say);
  });

  // Message handlers
  app.message(/^hello|hi|hey/i, async ({ message, say }) => {
    await handleGreeting(message.text, say);
  });
};

module.exports = { registerSlackHandlers };