const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const auth = require("./auth/auth");
const { authenticate } = require("./auth/middleware");
const config = require("./config");

const app = express();

// Middleware
app.use(helmet());
app.use(bodyParser.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  message: "Too many requests, please try again later",
});

app.get("/", (req, res) => {
  res.send("Welcome to the Simple Auth System!");
  res.status(200).json({
    message: "Welcome to the Simple Auth System!",
    routes: {
      register: "/register",
      login: "/login",
      refresh: "/refresh-token",
      profile: "/profile",
    },
  });
});

// Routes
app.post("/register", authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const user = await auth.register(username, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/login", authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const result = await auth.login(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post("/refresh-token", (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const result = auth.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
});

app.get("/profile", authenticate, (req, res) => {
  const user = auth.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log(`Try registering a user with POST /register`);
  console.log(`Then login with POST /login`);
  console.log(
    `Use the returned access token to access protected routes like GET /profile`
  );
  console.log(
    `You can also refresh your access token using POST /refresh-token`
  );
  console.log(
    `Remember to change the JWT_SECRET in config.js before deploying to production!`
  );
  console.log("❌ Press Ctrl+C to stop the server.");
});
