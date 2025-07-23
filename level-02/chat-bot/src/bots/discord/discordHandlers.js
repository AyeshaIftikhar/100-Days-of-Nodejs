const { handleGreeting, handleHelp, handleWeather } = require('../common/commands');

const registerDiscordHandlers = (client) => {
  // Ready event
  client.once('ready', () => {
    console.log('Discord bot is ready!');
  });

  // Message handlers
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Handle greetings
    if (/^hello|hi|hey/i.test(message.content)) {
      await handleGreeting(message.content, message.channel);
    }

    // Handle commands
    if (message.content.startsWith('!weather')) {
      const location = message.content.split(' ').slice(1).join(' ');
      await handleWeather(location, message.channel);
    }

    if (message.content.startsWith('!help')) {
      await handleHelp(message.channel);
    }
  });

  // Interaction handlers (for slash commands)
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'weather') {
      const location = options.getString('location');
      await handleWeather(location, interaction);
    }

    if (commandName === 'help') {
      await handleHelp(interaction);
    }
  });
};

module.exports = { registerDiscordHandlers };