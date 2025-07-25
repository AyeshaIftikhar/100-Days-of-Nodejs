const mongoose = require('mongoose');

const pdfTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['invoice', 'report', 'certificate', 'other'],
  },
  content: {
    type: String,
    required: true,
  },
  styles: {
    type: Object,
    default: {},
  },
  variables: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

pdfTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PdfTemplate', pdfTemplateSchema);