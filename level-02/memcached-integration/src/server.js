const http = require('http');
const app = require('./app');
const { port } = require('./config');
const { shutdown } = require('./cache');

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

function gracefulExit(signal) {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(() => {
    shutdown();
    console.log('✅ Closed server and Memcached connections.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulExit('SIGINT'));
process.on('SIGTERM', () => gracefulExit('SIGTERM'));
