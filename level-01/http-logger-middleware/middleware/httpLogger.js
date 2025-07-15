const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logStream = fs.createWriteStream(path.join(logDir, 'http-logs.txt'), { flags: 'a' });

const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms\n`;

    console.log(log.trim());
    logStream.write(log);
  });

  next();
};

module.exports = httpLogger;
