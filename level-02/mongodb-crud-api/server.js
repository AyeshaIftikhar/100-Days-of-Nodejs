const app = require("./app");
const { PORT, NODE_ENV } = require("./config/env");

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the API`);
  console.log("Press Ctrl+C to stop the server");
});
