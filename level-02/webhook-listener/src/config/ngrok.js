const ngrok = require('ngrok');
const dotenv = require('dotenv');

dotenv.config();

const startNgrok = async () => {
  try {
    const url = await ngrok.connect({
      addr: process.env.PORT,
      authtoken: process.env.NGROK_AUTH_TOKEN,
    });
    console.log(`Ngrok tunnel opened at: ${url}`);
    return url;
  } catch (error) {
    console.error('Error opening ngrok tunnel:', error);
    process.exit(1);
  }
};

module.exports = { startNgrok };