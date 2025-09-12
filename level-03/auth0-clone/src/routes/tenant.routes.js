const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticateJwt, authorize } = require('../middleware/auth.middleware');

// Get current tenant - public
router.get('/current', tenantController.getCurrentTenant);

// Tenant management - authenticated routes
router.get('/', 
  authenticateJwt, 
  authorize(['read:tenants']), 
  tenantController.listTenants
);

router.post('/', 
  authenticateJwt, 
  authorize(['create:tenants']), 
  tenantController.createTenant
);

router.get('/:tenantId', 
  authenticateJwt, 
  authorize(['read:tenants']), 
  tenantController.getTenantById
);

router.put('/:tenantId', 
  authenticateJwt, 
  authorize(['update:tenants']), 
  tenantController.updateTenant
);

router.delete('/:tenantId', 
  authenticateJwt, 
  authorize(['delete:tenants']), 
  tenantController.deleteTenant
);

// API key management
router.post('/:tenantId/api-keys', 
  authenticateJwt, 
  authorize(['manage:api-keys']), 
  tenantController.generateApiKey
);

module.exports = router;
