const userService = require('../services/user.service');
const { AppError } = require('../middleware/error.middleware');

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenant._id;

    const user = await userService.getUserById(userId, tenantId);

    res.status(200).json({
      success: true,
      data: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenant._id;
    const updateData = req.body;

    const user = await userService.updateUserProfile(userId, updateData, tenantId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getProfile()
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const tenantId = req.tenant._id;
    const passwordPolicy = req.tenant.settings.passwordPolicy;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    await userService.changePassword(
      userId, 
      currentPassword, 
      newPassword, 
      tenantId,
      passwordPolicy
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user roles
const getUserRoles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tenantId = req.tenant._id;

    const roles = await userService.getUserRoles(userId, tenantId);

    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenant._id;

    const user = await userService.getUserById(userId, tenantId);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Admin: List users
const listUsers = async (req, res, next) => {
  try {
    const tenantId = req.tenant._id;
    const { page, limit, sort, email, firstName, lastName, active } = req.query;

    // Build filter
    const filter = {};
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (firstName) filter.firstName = { $regex: firstName, $options: 'i' };
    if (lastName) filter.lastName = { $regex: lastName, $options: 'i' };
    if (active !== undefined) filter.active = active === 'true';

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: sort || '-createdAt',
      filter
    };

    const result = await userService.listUsers(tenantId, options);

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Assign role to user
const assignRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    const tenantId = req.tenant._id;

    if (!roleId) {
      throw new AppError('Role ID is required', 400);
    }

    const user = await userService.assignRoleToUser(userId, roleId, tenantId);

    res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Remove role from user
const removeRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    const tenantId = req.tenant._id;

    const user = await userService.removeRoleFromUser(userId, roleId, tenantId);

    res.status(200).json({
      success: true,
      message: 'Role removed successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserRoles,
  getUserById,
  listUsers,
  assignRole,
  removeRole
};
