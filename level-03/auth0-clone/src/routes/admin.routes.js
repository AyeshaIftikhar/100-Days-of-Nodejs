const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const roleController = require('../controllers/role.controller');
const tenantController = require('../controllers/tenant.controller');
const { authenticateJwt, authorize } = require('../middleware/auth.middleware');

// All routes require admin permissions
router.use(authenticateJwt);
router.use(authorize(['*'])); // Admin permission

// User management
router.get('/users', userController.listUsers);
router.get('/users/:userId', userController.getUserById);
router.post('/users/:userId/roles', userController.assignRole);
router.delete('/users/:userId/roles/:roleId', userController.removeRole);

// Role management
router.get('/roles', roleController.listRoles);
router.post('/roles', roleController.createRole);
router.get('/roles/:roleId', roleController.getRoleById);
router.put('/roles/:roleId', roleController.updateRole);
router.delete('/roles/:roleId', roleController.deleteRole);

// Tenant management
router.get('/tenants', tenantController.listTenants);
router.post('/tenants', tenantController.createTenant);
router.get('/tenants/:tenantId', tenantController.getTenantById);
router.put('/tenants/:tenantId', tenantController.updateTenant);
router.delete('/tenants/:tenantId', tenantController.deleteTenant);
router.post('/tenants/:tenantId/api-keys', tenantController.generateApiKey);

module.exports = router;
