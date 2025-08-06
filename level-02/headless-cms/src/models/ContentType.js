const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FieldSchema = new Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['String', 'Text', 'Number', 'Boolean', 'Date', 'Media', 'Reference']
  },
  required: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  options: { type: Schema.Types.Mixed }
});

const ContentTypeSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  fields: [FieldSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Dynamic model generation
ContentTypeSchema.statics.generateModel = function(contentType) {
  const schemaObj = { createdBy: { type: Schema.Types.ObjectId, ref: 'User' } };
  
  contentType.fields.forEach(field => {
    schemaObj[field.name] = {
      type: this.getFieldType(field.type),
      required: field.required,
      unique: field.unique
    };
    
    if (field.type === 'Reference') {
      schemaObj[field.name].ref = field.options.model;
    }
  });
  
  return new Schema(schemaObj, { timestamps: true });
};

ContentTypeSchema.statics.getFieldType = function(type) {
  const types = {
    'String': String,
    'Text': String,
    'Number': Number,
    'Boolean': Boolean,
    'Date': Date,
    'Media': String // Stores URL/path to media
  };
  return types[type] || String;
};

module.exports = mongoose.model('ContentType', ContentTypeSchema);