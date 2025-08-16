const Router = require('koa-router');
const router = new Router({ prefix: '/public' });

// Health check
router.get('/health', async ctx => {
  ctx.body = { status: 'ok' };
});

// Public info endpoint
router.get('/info', async ctx => {
  ctx.body = {
    name: 'Headless CMS',
    version: '1.0.0',
    description: 'API-first content management system'
  };
});

module.exports = router;
