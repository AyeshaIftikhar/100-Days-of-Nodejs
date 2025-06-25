const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");
const https = require("https");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://www.example.com", // <-- Replace with your actual target
    changeOrigin: true,
  })
);

// Request filtering middleware
app.use("/proxy", (req, res, next) => {
  console.log("Incoming request:", req.method, req.url);

  // Example: Block certain user agents
  if (req.headers["user-agent"]?.includes("curl")) {
    return res.status(403).json({ error: "curl requests are not allowed" });
  }

  next();
});

// Proxy configuration
const createProxy = (target, route) => {
  console.log(`Setting up proxy for ${target} at route ${`^${route}`}`);
  const options = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: "",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to ${target}: ${req.method} ${req.url}`);
      // Add custom headers to proxied request
      proxyReq.setHeader("X-Proxy-Server", "NodeJS-Proxy");
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add custom headers to response
      proxyRes.headers["X-Proxy-Server"] = "NodeJS-Proxy";
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Proxy error occurred" });
    },
  };

  if (target.startsWith("https://")) {
    options.secure = false;
    options.agent = new https.Agent({ rejectUnauthorized: false });
  }

  return createProxyMiddleware(options);
};

// Set up proxies
app.use(createProxy("http://github.com", "/proxy"));
app.use(createProxy("https://example.com", "/https-proxy"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`HTTP proxy available at /proxy`);
  console.log(`HTTPS proxy available at /https-proxy`);
  console.log(`Health check endpoint available at /health`);
  console.log("❌ To stop the server, press Ctrl+C");
});
