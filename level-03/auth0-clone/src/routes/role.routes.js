const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticateJwt, authorize } = require('../middleware/auth.middleware');

// All routes require authentication and proper permissions
router.get('/', 
  authenticateJwt, 
  authorize(['read:roles']), 
  roleController.listRoles
);

router.post('/', 
  authenticateJwt, 
  authorize(['create:roles']), 
  roleController.createRole
);

router.get('/:roleId', 
  authenticateJwt, 
  authorize(['read:roles']), 
  roleController.getRoleById
);

router.put('/:roleId', 
  authenticateJwt, 
  authorize(['update:roles']), 
  roleController.updateRole
);

router.delete('/:roleId', 
  authenticateJwt, 
  authorize(['delete:roles']), 
  roleController.deleteRole
);

module.exports = router;
