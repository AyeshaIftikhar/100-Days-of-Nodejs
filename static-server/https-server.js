const https = require('https');
const fs = require('fs');
const app = require('./app');
const config = require('./config');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(config.PORT, () => {
  console.log(`HTTPS server running on port ${config.PORT}`);
  console.log(`SSL Certificate is valid`);
  console.log(`Serving files from: ${config.PUBLIC_DIR}`);
  console.log('Press Ctrl+C to stop the server');
});