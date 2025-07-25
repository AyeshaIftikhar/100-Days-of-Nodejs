const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  storagePath: process.env.PDF_STORAGE_PATH || './generated-pdfs',
  fonts: {
    regular: path.join(__dirname, '../../templates/fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../../templates/fonts/Roboto-Bold.ttf'),
    italic: path.join(__dirname, '../../templates/fonts/Roboto-Italic.ttf'),
  },
  defaultStyles: {
    title: {
      fontSize: 24,
      bold: true,
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 18,
      bold: true,
      marginBottom: 15,
    },
    body: {
      fontSize: 12,
      lineGap: 5,
    },
  },
};