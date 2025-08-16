const Router = require('koa-router');
const AuthController = require('../controllers/AuthController');
const router = new Router({ prefix: '/auth' });

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;
