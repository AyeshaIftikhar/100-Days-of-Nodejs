const { Tenant } = require('../models/tenant.model');

// Middleware to resolve tenant from domain or custom header
const resolveTenant = async (req, res, next) => {
  try {
    let tenantIdentifier;

    // Check for tenant in custom header
    if (req.headers['x-tenant-id']) {
      tenantIdentifier = req.headers['x-tenant-id'];
    } 
    // Check for tenant in hostname (subdomain)
    else if (req.hostname && req.hostname !== 'localhost') {
      const hostParts = req.hostname.split('.');
      if (hostParts.length > 1) {
        tenantIdentifier = hostParts[0];
      }
    }

    // Use default tenant if none specified
    if (!tenantIdentifier) {
      tenantIdentifier = 'default';
    }

    // Find tenant by domain
    const tenant = await Tenant.findOne({ 
      domain: tenantIdentifier,
      isActive: true
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found or inactive'
      });
    }

    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { resolveTenant };
