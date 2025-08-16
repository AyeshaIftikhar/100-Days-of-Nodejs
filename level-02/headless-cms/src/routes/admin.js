const Router = require('koa-router');
const { hasRole } = require('../utils/middleware');
const User = require('../models/User');
const router = new Router({ prefix: '/admin' });

// List all users (admin only)
router.get('/users', hasRole('admin'), async ctx => {
  ctx.body = await User.find({}, '-password');
});

module.exports = router;
