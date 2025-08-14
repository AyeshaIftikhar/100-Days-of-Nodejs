# Slack/Discord Bot

A dual-platform chatbot that works with both Slack and Discord, providing consistent functionality across both platforms.

## Features

- **Multi-platform support**: Works on Slack and Discord
- **Common command set**: Same commands work on both platforms
- **Weather integration**: Get weather for any location
- **Help system**: Built-in help command
- **Database integration**: MongoDB for data persistence
- **Modular architecture**: Easy to extend with new commands

## Setup

### Prerequisites

- Node.js (v16 or higher)
- Slack workspace (for Slack bot)
- Discord server (for Discord bot)
- MongoDB database
- OpenWeatherMap API key (for weather command)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Run the application: `npm run dev`

### Slack Setup

1. Create a new Slack app at [api.slack.com](https://api.slack.com/apps)
2. Add bot token scopes:
   - `app_mentions:read`
   - `chat:write`
   - `commands`
3. Install the app to your workspace
4. Add credentials to `.env`

### Discord Setup

1. Create a new Discord application at [discord.com/developers](https://discord.com/developers)
2. Create a bot user
3. Add bot token to `.env`
4. Invite the bot to your server using OAuth2 URL generator

## Available Commands

### Both Platforms
- **Greeting**: Responds to "hello", "hi", "hey"
- `!help` or `/help`: Shows help message
- `!weather <location>` or `/weather <location>`: Shows weather for location

### Slack Only
- `@botname`: Mentions trigger the bot
- Slash commands: `/weather`, `/help`

### Discord Only
- Slash commands (type `/` to see available commands)

## Environment Variables

- `SLACK_SIGNING_SECRET`: Slack app signing secret
- `SLACK_BOT_TOKEN`: Slack bot OAuth token
- `SLACK_APP_TOKEN`: Slack app-level token
- `DISCORD_TOKEN`: Discord bot token
- `DISCORD_CLIENT_ID`: Discord application client ID
- `DISCORD_GUILD_ID`: Discord server ID for testing
- `MONGODB_URI`: MongoDB connection string
- `WEATHER_API_KEY`: OpenWeatherMap API key

## Architecture

- **Platform-specific handlers**: Separate implementations for Slack and Discord
- **Common command logic**: Shared functionality across platforms
- **Unified response system**: Consistent message formatting
- **Service layer**: External API and database integration

## Future Enhancements

1. Add more commands (quotes, reminders, etc.)
2. Implement user preferences stored in DB
3. Add natural language processing
4. Implement scheduled messages
5. Add admin commands
6. Support more chat platforms
7. Implement plugin system for commands
8. Add analytics tracking

## License

This project is licensed under the MIT License.


```bash
npm install @slack/bolt discord.js axios mongoose dotenv
npm install --save-dev nodemon
```