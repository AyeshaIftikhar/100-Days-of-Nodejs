const pino = require('pino');
const axios = require('axios');
const { serviceEnv, serviceName, logLevel, logstashUrl } = require('./config');

/**
 * Custom async transport that posts JSON logs to Logstash's HTTP input.
 * If Logstash is down, it fails silently (but logs to console) to avoid
 * crashing the app. In production, consider a buffer/retry queue (future work).
 */
function createLogstashTransport(url) {
  return async function transport(logObj) {
    try {
      // Send as NDJSON line (Logstash http input with codec => json_lines)
      await axios.post(url, JSON.stringify(logObj) + '\n', {
        headers: { 'Content-Type': 'application/x-ndjson' },
        timeout: 1000
      });
    } catch (e) {
      // Best-effort: write a warning to console only
      // eslint-disable-next-line no-console
      console.warn('[logstash-transport] failed to ship log:', e.message);
    }
  };
}

const base = {
  name: serviceName,
  env: serviceEnv
};

const logger = pino(
  {
    level: logLevel,
    base,
    timestamp: pino.stdTimeFunctions.isoTime
  },
  pino.transport({
    targets: [
      // Human-friendly console in dev; JSON in prod
      { target: 'pino/file', options: { destination: 1 } },
      // Ship to Logstash over HTTP
      {
        target: createLogstashTransport, // our custom target (factory)
        options: logstashUrl
      }
    ]
  })
);

module.exports = logger;
