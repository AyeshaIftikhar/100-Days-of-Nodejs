require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const jwt = require('koa-jwt');
const { requestLogger, errorHandler } = require('./utils/middleware');

// Initialize app
const app = new Koa();
const router = new Router();

// Database connection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', console.error);

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(requestLogger());
app.use(errorHandler());


const contentService = require('./services/ContentService');

// Register routers
const publicRouter = require('./routes/public');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const contentRouter = require('./routes/content');

app.use(publicRouter.routes()).use(publicRouter.allowedMethods());
app.use(authRouter.routes()).use(authRouter.allowedMethods());

// JWT authentication for protected routes
app.use(jwt({ secret: process.env.JWT_SECRET }).unless({ path: [/^\/public/, /^\/auth/] }));

app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
app.use(contentRouter.routes()).use(contentRouter.allowedMethods());

// Initialize dynamic models
contentService.initialize();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

module.exports = app;