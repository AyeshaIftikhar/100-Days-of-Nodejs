const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const config = require('./config');

// Generate short code
const generateShortCode = () => nanoid(config.SHORT_CODE_LENGTH);

// Validate URL
const isValidUrl = (url) => validUrl.isUri(url);

module.exports = {
  generateShortCode,
  isValidUrl
};