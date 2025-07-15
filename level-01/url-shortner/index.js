const express = require("express");
const app = express();
const urlRoutes = require("./routes/urlRoutes");
const config = require("./utils/config");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/", urlRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "✅ URL Shortener API is running" });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`URL shortener running on ${config.BASE_URL}`);
  console.log(`Listening on port ${config.PORT}`);
  console.log(`❌ Press Ctrl+C to stop the server`);
});
