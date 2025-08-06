require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const jwt = require('koa-jwt');
const { logger, errorHandler } = require('./utils/middleware');

// Initialize app
const app = new Koa();
const router = new Router();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('error', console.error);

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(logger());
app.use(errorHandler());

// Public routes
require('./routes/public')(router);

// JWT authentication for protected routes
app.use(jwt({ secret: process.env.JWT_SECRET }).unless({ path: [/^\/public/] }));

// Protected routes
require('./routes/admin')(router);
require('./routes/content')(router);

// Apply routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;