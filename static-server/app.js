const express = require("express");
const path = require("path");
const compression = require("compression");
const config = require("./config");
const directoryMiddleware = require("./middlewares/directory");
const securityMiddleware = require("./middlewares/security");
const express = require("express");
const expressStatic = require("express").static;
const path = require("path");
const mime = require("mime");
const basicAuth = require("express-basic-auth");

class App {
  constructor() {
    this.app = express();
    this._initializeMiddlewares();
    this._initializeRoutes();
  }

  _initializeMiddlewares() {
    // Security headers
    this.app.use(securityMiddleware);

    // Gzip compression
    this.app.use(compression());

    // Custom directory listing
    this.app.use(directoryMiddleware);

    /// password protection using basic auth
    // Add to _initializeMiddlewares()
    this.app.use(
      basicAuth({
        users: { admin: "password123" },
        challenge: true,
        realm: "Static Files",
      })
    );
  }

  _initializeRoutes() {
    // Add custom MIME types
    mime.define(
      {
        "application/wasm": ["wasm"],
        "text/markdown": ["md"],
      },
      true
    );

    // Custom static middleware function
    const static = (root, options) => {
      const staticMiddleware = express.static(root, options);
      return (req, res, next) => {
        // Set custom MIME type for specific extensions
        if (req.path.endsWith(".md")) {
          res.type("text/markdown");
        }
        staticMiddleware(req, res, next);
      };
    };

    // Serve static files with caching using our custom middleware
    this.app.use(
      static(config.PUBLIC_DIR, {
        maxAge: config.CACHE_CONTROL,
        setHeaders: (res, filePath) => {
          if (filePath.includes("index.html")) {
            // Disable caching for HTML files
            res.setHeader("Cache-Control", "no-store");
          }
        },
      })
    );
    
    /// Serve static files with caching
    // this.app.use(
    //   static(config.PUBLIC_DIR, {
    //     maxAge: config.CACHE_CONTROL,
    //     setHeaders: (res, filePath) => {
    //       if (filePath.includes("index.html")) {
    //         // Disable caching for HTML files
    //         res.setHeader("Cache-Control", "no-store");
    //       }
    //     },
    //   })
    // );

    // Handle 404
    this.app.use((req, res) => {
      const errorPage = path.join(config.PUBLIC_DIR, "404.html");
      if (fs.existsSync(errorPage)) {
        res.status(404).sendFile(errorPage);
      } else {
        res.status(404).send("404 - Not Found");
      }
    });
  }
}

module.exports = new App().app;
