const app = require("./app");
const config = require("./config");

app.listen(config.app.port, () => {
  console.log(`Palindrome API running on port ${config.app.port}`);
  console.log(
    `API endpoint: http://localhost:${config.app.port}${config.app.apiPrefix}/palindrome`
  );
  console.log(
    `Documentation: http://localhost:${config.app.port}${config.app.apiPrefix}/docs`
  );
  console.log("Press Ctrl+C to stop the server");
});
