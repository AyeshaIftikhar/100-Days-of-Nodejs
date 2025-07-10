const app = require('./app');
const config = require('./config');

app.listen(config.PORT, config.HOST, () => {
  console.log(`Static file server running at http://${config.HOST}:${config.PORT}`);
  console.log(`Serving files from: ${config.PUBLIC_DIR}`);
  console.log('Press Ctrl+C to stop the server');
});