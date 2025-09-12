const User = require('../models/user.model');
const { Role } = require('../models/role.model');
const { AppError } = require('../middleware/error.middleware');
const { sanitizeInput } = require('../utils/validation.utils');

// Get user by ID
const getUserById = async (userId, tenantId) => {
  const user = await User.findOne({ 
    _id: userId,
    tenantId
  }).populate('roles');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

// Update user profile
const updateUserProfile = async (userId, updateData, tenantId) => {
  // Sanitize input
  const sanitizedData = sanitizeInput(updateData);
  
  // Fields that are allowed to be updated
  const allowedFields = ['firstName', 'lastName', 'picture', 'metadata'];
  
  // Filter to only allowed fields
  const updateFields = {};
  Object.keys(sanitizedData).forEach(key => {
    if (allowedFields.includes(key)) {
      updateFields[key] = sanitizedData[key];
    }
  });

  // Update user
  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

// Change user password
const changePassword = async (userId, oldPassword, newPassword, tenantId, passwordPolicy) => {
  // Find user
  const user = await User.findOne({ _id: userId, tenantId });
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Validate new password
  const { validatePassword } = require('../utils/validation.utils');
  const validation = validatePassword(newPassword, passwordPolicy);
  
  if (!validation.isValid) {
    throw new AppError('Password validation failed', 400, { errors: validation.errors });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return { success: true };
};

// Get user roles
const getUserRoles = async (userId, tenantId) => {
  const user = await User.findOne({ 
    _id: userId,
    tenantId
  }).populate('roles');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user.roles;
};

// Assign role to user
const assignRoleToUser = async (userId, roleId, tenantId) => {
  // Check if role exists
  const role = await Role.findOne({ 
    _id: roleId,
    tenantId
  });

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  // Update user
  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { $addToSet: { roles: roleId } },
    { new: true }
  ).populate('roles');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

// Remove role from user
const removeRoleFromUser = async (userId, roleId, tenantId) => {
  // Update user
  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { $pull: { roles: roleId } },
    { new: true }
  ).populate('roles');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

// List users
const listUsers = async (tenantId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    filter = {}
  } = options;

  // Add tenant filter
  const query = { 
    tenantId,
    ...filter
  };

  // Execute query with pagination
  const users = await User.find(query)
    .select('-password -refreshTokens -verificationToken -resetPasswordToken -resetPasswordExpires')
    .populate('roles')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  // Get total count
  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getUserById,
  updateUserProfile,
  changePassword,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  listUsers
};
