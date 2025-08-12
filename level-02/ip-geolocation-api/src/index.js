const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const geoRoutes = require("./routes/geo");
const rateLimiter = require("./middleware/rateLimiter");
const logger = require("./utils/logger");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.json({
    name: "IP Geolocation API",
    version: "1.0.0",
    description: "Lookup location for an IP address or the request origin",
    endpoints: [
      {
        method: "GET",
        path: "/geo?ip=<ip>",
        desc: "Lookup by IP (optional: if not provided, use request IP)",
      },
      { method: "GET", path: "/me", desc: "Lookup using request origin IP" },
    ],
  });
});

// Apply rate limiter to API routes
app.use("/api", rateLimiter);

app.use("/api", geoRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`IP Geolocation API running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the API`);
  console.log("Press Ctrl+C to stop the server");
});
