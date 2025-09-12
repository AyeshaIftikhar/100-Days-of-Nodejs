const { Tenant } = require('../models/tenant.model');
const { AppError } = require('../middleware/error.middleware');
const { sanitizeInput } = require('../utils/validation.utils');
const crypto = require('crypto');

// Create a new tenant
const createTenant = async (tenantData, ownerId) => {
  // Sanitize input
  const sanitizedData = sanitizeInput(tenantData);
  
  // Check if tenant with this domain already exists
  const existingTenant = await Tenant.findOne({ 
    domain: sanitizedData.domain
  });
  
  if (existingTenant) {
    throw new AppError('Tenant with this domain already exists', 409);
  }

  // Create new tenant
  const tenant = new Tenant({
    ...sanitizedData,
    owner: ownerId
  });

  await tenant.save();
  return tenant;
};

// Get tenant by ID
const getTenantById = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  return tenant;
};

// Update tenant
const updateTenant = async (tenantId, updateData, ownerId) => {
  // Sanitize input
  const sanitizedData = sanitizeInput(updateData);
  
  // Check if tenant exists and user is the owner
  const tenant = await Tenant.findOne({ 
    _id: tenantId,
    owner: ownerId
  });
  
  if (!tenant) {
    throw new AppError('Tenant not found or you do not have permission', 404);
  }

  // Don't allow changing domain
  if (sanitizedData.domain && sanitizedData.domain !== tenant.domain) {
    throw new AppError('Cannot change tenant domain', 400);
  }

  // Update tenant
  const updatedTenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { $set: sanitizedData },
    { new: true, runValidators: true }
  );

  return updatedTenant;
};

// Delete tenant
const deleteTenant = async (tenantId, ownerId) => {
  // Check if tenant exists and user is the owner
  const tenant = await Tenant.findOne({ 
    _id: tenantId,
    owner: ownerId
  });
  
  if (!tenant) {
    throw new AppError('Tenant not found or you do not have permission', 404);
  }

  // Check if it's the default tenant
  if (tenant.domain === 'default') {
    throw new AppError('Cannot delete the default tenant', 403);
  }

  // Delete tenant
  await Tenant.findByIdAndDelete(tenantId);
  return { success: true };
};

// Generate API key for tenant
const generateApiKey = async (tenantId, keyName, permissions, ownerId) => {
  // Check if tenant exists and user is the owner
  const tenant = await Tenant.findOne({ 
    _id: tenantId,
    owner: ownerId
  });
  
  if (!tenant) {
    throw new AppError('Tenant not found or you do not have permission', 404);
  }

  // Generate API key
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  // Add API key to tenant
  tenant.apiKeys.push({
    key: apiKey,
    name: keyName,
    permissions: permissions || [],
    createdAt: new Date(),
    lastUsed: null
  });

  await tenant.save();

  return {
    key: apiKey,
    name: keyName
  };
};

// List tenants for owner
const listTenants = async (ownerId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt'
  } = options;

  // Execute query with pagination
  const tenants = await Tenant.find({ owner: ownerId })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  // Get total count
  const total = await Tenant.countDocuments({ owner: ownerId });

  return {
    tenants,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
  generateApiKey,
  listTenants
};
