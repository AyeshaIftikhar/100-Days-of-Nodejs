// Basic logger utility
module.exports = {
  info: (msg) => console.log(`INFO: ${msg}`),
  warn: (msg) => console.warn(`WARN: ${msg}`),
  error: (msg) => console.error(`ERROR: ${msg}`)
};
