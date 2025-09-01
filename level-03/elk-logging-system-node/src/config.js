require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  serviceName: process.env.SERVICE_NAME || 'node-app',
  serviceEnv: process.env.SERVICE_ENV || 'dev',
  logLevel: process.env.LOG_LEVEL || 'info',
  logstashUrl: process.env.LOGSTASH_URL || 'http://localhost:8080'
};

module.exports = config;
