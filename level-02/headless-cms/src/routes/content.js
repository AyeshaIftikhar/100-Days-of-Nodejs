const Router = require('koa-router');
const contentController = require('../controllers/ContentController');
const { hasRole } = require('../utils/middleware');

const router = new Router({ prefix: '/content' });

// Content Type management (admin only)
router.post('/types', hasRole('admin'), contentController.createType);

// Content Item CRUD
router.post('/:contentType', contentController.createItem);
router.get('/:contentType', contentController.getItems);
router.get('/:contentType/:id', contentController.getItem);
router.put('/:contentType/:id', contentController.updateItem);
router.delete('/:contentType/:id', contentController.deleteItem);

module.exports = router;