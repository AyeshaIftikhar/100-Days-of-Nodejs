const tenantService = require('../services/tenant.service');
const { AppError } = require('../middleware/error.middleware');

// Create a new tenant
const createTenant = async (req, res, next) => {
  try {
    const tenantData = req.body;
    const ownerId = req.user.id;

    if (!tenantData.name || !tenantData.domain) {
      throw new AppError('Tenant name and domain are required', 400);
    }

    const tenant = await tenantService.createTenant(tenantData, ownerId);

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

// Get tenant by ID
const getTenantById = async (req, res, next) => {
  try {
    const { tenantId } = req.params;

    const tenant = await tenantService.getTenantById(tenantId);

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

// Update tenant
const updateTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const updateData = req.body;
    const ownerId = req.user.id;

    const tenant = await tenantService.updateTenant(tenantId, updateData, ownerId);

    res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

// Delete tenant
const deleteTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const ownerId = req.user.id;

    await tenantService.deleteTenant(tenantId, ownerId);

    res.status(200).json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Generate API key
const generateApiKey = async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { name, permissions } = req.body;
    const ownerId = req.user.id;

    if (!name) {
      throw new AppError('API key name is required', 400);
    }

    const apiKey = await tenantService.generateApiKey(
      tenantId, 
      name, 
      permissions, 
      ownerId
    );

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: apiKey
    });
  } catch (error) {
    next(error);
  }
};

// List tenants
const listTenants = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { page, limit, sort } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: sort || '-createdAt'
    };

    const result = await tenantService.listTenants(ownerId, options);

    res.status(200).json({
      success: true,
      data: result.tenants,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// Get current tenant
const getCurrentTenant = async (req, res, next) => {
  try {
    const tenant = req.tenant;

    // Remove sensitive data
    const tenantData = {
      _id: tenant._id,
      name: tenant.name,
      domain: tenant.domain,
      logoUrl: tenant.logoUrl,
      colors: tenant.colors,
      settings: {
        allowSignup: tenant.settings.allowSignup,
        requireEmailVerification: tenant.settings.requireEmailVerification,
        passwordPolicy: tenant.settings.passwordPolicy,
        mfaEnabled: tenant.settings.mfaEnabled,
        socialLogins: {
          google: {
            enabled: tenant.settings.socialLogins?.google?.enabled || false
          },
          github: {
            enabled: tenant.settings.socialLogins?.github?.enabled || false
          }
        }
      }
    };

    res.status(200).json({
      success: true,
      data: tenantData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
  generateApiKey,
  listTenants,
  getCurrentTenant
};
