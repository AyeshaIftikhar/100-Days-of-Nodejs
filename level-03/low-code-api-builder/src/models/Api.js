const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array'],
  },
  required: {
    type: Boolean,
    default: false,
  },
  unique: {
    type: Boolean,
    default: false,
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  reference: {
    type: String, // For ObjectId type, reference to another model
    default: null,
  },
  enum: {
    type: [String], // For String type with enum values
    default: null,
  },
  min: {
    type: Number, // For Number type
    default: null,
  },
  max: {
    type: Number, // For Number type
    default: null,
  },
  match: {
    type: String, // For String type with regex validation
    default: null,
  },
  description: {
    type: String,
  },
});

const EndpointSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  path: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  requireAuth: {
    type: Boolean,
    default: true,
  },
  roles: {
    type: [String],
    default: ['admin', 'user'],
  },
  customLogic: {
    type: String, // JavaScript code as string
    default: null,
  },
});

const ApiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    fields: [FieldSchema],
    endpoints: [EndpointSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    baseUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create a dynamic model for this API
ApiSchema.methods.createModel = function () {
  const modelName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  
  // Check if model already exists
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  
  // Create schema definition based on fields
  const schemaDefinition = {};
  
  this.fields.forEach((field) => {
    const fieldConfig = {
      type: mongoose.Schema.Types[field.type],
      required: field.required,
      unique: field.unique,
    };
    
    // Add additional field validations if defined
    if (field.defaultValue !== undefined) {
      fieldConfig.default = field.defaultValue;
    }
    
    if (field.type === 'ObjectId' && field.reference) {
      fieldConfig.ref = field.reference;
    }
    
    if (field.type === 'String' && field.enum) {
      fieldConfig.enum = field.enum;
    }
    
    if (field.type === 'Number') {
      if (field.min !== null) fieldConfig.min = field.min;
      if (field.max !== null) fieldConfig.max = field.max;
    }
    
    if (field.type === 'String' && field.match) {
      fieldConfig.match = new RegExp(field.match);
    }
    
    schemaDefinition[field.name] = fieldConfig;
  });
  
  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  return mongoose.model(modelName, schema);
};

module.exports = mongoose.model('Api', ApiSchema);
