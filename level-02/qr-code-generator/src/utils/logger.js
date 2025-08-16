// src/utils/logger.js
const log = (...args) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('[LOG]', ...args);
  }
};

const error = (...args) => {
  console.error('[ERROR]', ...args);
};

module.exports = { log, error };
