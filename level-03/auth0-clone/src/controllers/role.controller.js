const roleService = require('../services/role.service');
const { AppError } = require('../middleware/error.middleware');

// Create a new role
const createRole = async (req, res, next) => {
  try {
    const roleData = req.body;
    const tenantId = req.tenant._id;

    if (!roleData.name) {
      throw new AppError('Role name is required', 400);
    }

    const role = await roleService.createRole(roleData, tenantId);

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// Get role by ID
const getRoleById = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const tenantId = req.tenant._id;

    const role = await roleService.getRoleById(roleId, tenantId);

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// Update role
const updateRole = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const updateData = req.body;
    const tenantId = req.tenant._id;

    const role = await roleService.updateRole(roleId, updateData, tenantId);

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// Delete role
const deleteRole = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const tenantId = req.tenant._id;

    await roleService.deleteRole(roleId, tenantId);

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// List roles
const listRoles = async (req, res, next) => {
  try {
    const tenantId = req.tenant._id;
    const { page, limit, sort, name, isSystem } = req.query;

    // Build filter
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (isSystem !== undefined) filter.isSystem = isSystem === 'true';

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: sort || 'name',
      filter
    };

    const result = await roleService.listRoles(tenantId, options);

    res.status(200).json({
      success: true,
      data: result.roles,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  listRoles
};
