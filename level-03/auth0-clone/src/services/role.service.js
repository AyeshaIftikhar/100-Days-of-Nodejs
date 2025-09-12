const { Role } = require('../models/role.model');
const { AppError } = require('../middleware/error.middleware');
const { sanitizeInput } = require('../utils/validation.utils');

// Create a new role
const createRole = async (roleData, tenantId) => {
  // Sanitize input
  const sanitizedData = sanitizeInput(roleData);
  
  // Check if role with this name already exists
  const existingRole = await Role.findOne({ 
    name: sanitizedData.name,
    tenantId
  });
  
  if (existingRole) {
    throw new AppError('Role with this name already exists', 409);
  }

  // Create new role
  const role = new Role({
    ...sanitizedData,
    tenantId
  });

  await role.save();
  return role;
};

// Get role by ID
const getRoleById = async (roleId, tenantId) => {
  const role = await Role.findOne({ 
    _id: roleId,
    tenantId
  });

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  return role;
};

// Update role
const updateRole = async (roleId, updateData, tenantId) => {
  // Sanitize input
  const sanitizedData = sanitizeInput(updateData);
  
  // Don't allow changing system roles
  const role = await Role.findOne({ _id: roleId, tenantId });
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  if (role.isSystem) {
    throw new AppError('Cannot modify system roles', 403);
  }

  // Update role
  const updatedRole = await Role.findOneAndUpdate(
    { _id: roleId, tenantId },
    { $set: sanitizedData },
    { new: true, runValidators: true }
  );

  return updatedRole;
};

// Delete role
const deleteRole = async (roleId, tenantId) => {
  // Don't allow deleting system roles
  const role = await Role.findOne({ _id: roleId, tenantId });
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  if (role.isSystem) {
    throw new AppError('Cannot delete system roles', 403);
  }

  // Delete role
  await Role.findOneAndDelete({ _id: roleId, tenantId });
  return { success: true };
};

// List roles
const listRoles = async (tenantId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = 'name',
    filter = {}
  } = options;

  // Add tenant filter
  const query = { 
    tenantId,
    ...filter
  };

  // Execute query with pagination
  const roles = await Role.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  // Get total count
  const total = await Role.countDocuments(query);

  return {
    roles,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  listRoles
};
