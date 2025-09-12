const Joi = require('joi');

// Field validation schema
const fieldSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required().valid('String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array'),
  required: Joi.boolean().default(false),
  unique: Joi.boolean().default(false),
  defaultValue: Joi.any(),
  reference: Joi.string().allow(null).default(null),
  enum: Joi.array().items(Joi.string()).allow(null).default(null),
  min: Joi.number().allow(null).default(null),
  max: Joi.number().allow(null).default(null),
  match: Joi.string().allow(null).default(null),
  description: Joi.string().allow(''),
});

// Endpoint validation schema
const endpointSchema = Joi.object({
  method: Joi.string().required().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
  path: Joi.string().required(),
  description: Joi.string().allow(''),
  enabled: Joi.boolean().default(true),
  requireAuth: Joi.boolean().default(true),
  roles: Joi.array().items(Joi.string()).default(['admin', 'user']),
  customLogic: Joi.string().allow(null).default(null),
});

// API validation schema
exports.apiValidator = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().allow(''),
  fields: Joi.array().items(fieldSchema).min(1).required(),
  endpoints: Joi.array().items(endpointSchema).min(1).required(),
  published: Joi.boolean().default(false),
  version: Joi.string().default('1.0.0'),
  baseUrl: Joi.string().required(),
});
