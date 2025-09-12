const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
      },
    ],
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model('Role', roleSchema);

// Create default roles
const initializeRoles = async () => {
  try {
    const roles = [
      {
        name: 'admin',
        description: 'System administrator with full access',
        permissions: ['*'],
        isSystem: true,
      },
      {
        name: 'user',
        description: 'Regular user with limited access',
        permissions: ['read:own_profile', 'update:own_profile'],
        isSystem: true,
      },
    ];

    for (const role of roles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }
    
    console.log('Default roles initialized');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = { Role, initializeRoles };
