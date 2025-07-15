const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");
const https = require("https");
const fs = require("fs");

const app = express();

// Logging middleware
app.use(morgan("dev"));

/// Proxy configuration
const proxyOptions = {
  target: "http://example.com", // Change this to your target server
  changeOrigin: true,
  pathRewrite: {
    "^/proxy": "", // Remove /proxy from path
  },
  onProxyReq: (proxyReq, req, res) => {
    // You can modify the proxy request here
    console.log(`Proxying request: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error" });
  },
};
// http proxy support
const httpsProxyOptions = {
  ...proxyOptions,
  target: "https://example.com",
  secure: false, // For self-signed certificates
  agent: new https.Agent({
    rejectUnauthorized: false,
  }),
};

// request modification
const proxyOptionsWithResponseMod = {
  ...proxyOptions,
  selfHandleResponse: true,
  onProxyRes: (proxyRes, req, res) => {
    let body = [];
    proxyRes.on("data", (chunk) => {
      body.push(chunk);
    });
    proxyRes.on("end", () => {
      body = Buffer.concat(body).toString();
      // Modify the response here
      body = body.replace(/Example/g, "ProxyExample");
      res.setHeader("Content-Type", "text/html");
      res.setHeader("X-Proxy-Server", "NodeJS-Proxy");
      res.end(body);
    });
  },
};

// Adding Request Filtering
/* 
app.use("/proxy", (req, res, next) => {
  // Block requests to certain domains
  if (req.headers.host === "blocked-domain.com") {
    return res.status(403).send("Access to this domain is blocked");
  }
  next();
}); 
*/
// Proxy route
app.use("/proxy", createProxyMiddleware(proxyOptions)); // Proxy requests to the target server
app.use("/https-proxy", createProxyMiddleware(httpsProxyOptions)); // Proxy requests to the target server over HTTPS

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ${proxyOptions.target}`);
  console.log(`Use /proxy to access the target server`);
  console.log("❌ To stop the server, press Ctrl+C");
});
