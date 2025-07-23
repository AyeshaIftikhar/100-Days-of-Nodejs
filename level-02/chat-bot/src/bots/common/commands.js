const axios = require('axios');
const { WEATHER_API_KEY } = process.env;

// Register slash commands (Discord specific)
const registerCommands = async (client) => {
  if (client?.application?.commands) {
    await client.application.commands.create({
      name: 'weather',
      description: 'Get weather information for a location',
      options: [{
        name: 'location',
        description: 'The location to get weather for',
        type: 'STRING',
        required: true
      }]
    });

    await client.application.commands.create({
      name: 'help',
      description: 'Get help with bot commands'
    });
  }
};

// Command handlers
const handleGreeting = async (text, responseChannel) => {
  const reply = `Hello there! ${text.includes('?') ? 'How can I help you?' : ''}`;
  await respond(reply, responseChannel);
};

const handleHelp = async (responseChannel) => {
  const helpText = `
Available commands:
- *Weather*: Get weather for a location (e.g., !weather London)
- *Help*: Show this help message

Slash commands also available in Discord!
  `;
  await respond(helpText, responseChannel);
};

const handleWeather = async (location, responseChannel) => {
  if (!location) {
    await respond('Please provide a location (e.g., !weather London)', responseChannel);
    return;
  }

  try {
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    const weatherInfo = `
Weather in ${data.name}:
- Temperature: ${data.main.temp}°C
- Conditions: ${data.weather[0].description}
- Humidity: ${data.main.humidity}%
- Wind: ${data.wind.speed} m/s
    `;
    
    await respond(weatherInfo, responseChannel);
  } catch (error) {
    console.error('Weather API error:', error);
    await respond('Sorry, I couldn\'t fetch weather for that location.', responseChannel);
  }
};

// Unified response method
const respond = async (message, responseChannel) => {
  if (typeof responseChannel === 'object') {
    // Discord channel or interaction
    if (responseChannel.reply) {
      // Interaction
      await responseChannel.reply(message);
    } else {
      // Text channel
      await responseChannel.send(message);
    }
  } else if (typeof responseChannel === 'function') {
    // Slack say function
    await responseChannel(message);
  }
};

module.exports = {
  registerCommands,
  handleGreeting,
  handleHelp,
  handleWeather
};