const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logoUrl: {
      type: String,
    },
    colors: {
      primary: String,
      secondary: String,
      background: String,
      text: String,
    },
    settings: {
      allowSignup: {
        type: Boolean,
        default: true,
      },
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      passwordPolicy: {
        minLength: {
          type: Number,
          default: 8,
        },
        requireUppercase: {
          type: Boolean,
          default: true,
        },
        requireLowercase: {
          type: Boolean,
          default: true,
        },
        requireNumbers: {
          type: Boolean,
          default: true,
        },
        requireSpecialChars: {
          type: Boolean,
          default: true,
        },
      },
      mfaEnabled: {
        type: Boolean,
        default: false,
      },
      socialLogins: {
        google: {
          enabled: {
            type: Boolean,
            default: false,
          },
          clientId: String,
          clientSecret: String,
        },
        github: {
          enabled: {
            type: Boolean,
            default: false,
          },
          clientId: String,
          clientSecret: String,
        },
        // Add more providers as needed
      },
    },
    apiKeys: [
      {
        key: String,
        name: String,
        permissions: [String],
        createdAt: Date,
        lastUsed: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
tenantSchema.index({ domain: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

// Initialize default tenant
const initializeDefaultTenant = async () => {
  try {
    const defaultTenant = {
      name: 'Default Tenant',
      domain: 'default',
      colors: {
        primary: '#0059EB',
        secondary: '#6200EA',
        background: '#FFFFFF',
        text: '#333333',
      },
      settings: {
        allowSignup: true,
        requireEmailVerification: true,
        mfaEnabled: false,
      },
      isActive: true,
    };

    await Tenant.findOneAndUpdate(
      { domain: 'default' },
      defaultTenant,
      { upsert: true, new: true }
    );
    
    console.log('Default tenant initialized');
  } catch (error) {
    console.error('Error initializing default tenant:', error);
  }
};

module.exports = { Tenant, initializeDefaultTenant };
