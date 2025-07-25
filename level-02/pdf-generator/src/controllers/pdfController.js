const InvoiceGenerator = require('../generators/invoiceGenerator');
const ReportGenerator = require('../generators/reportGenerator');
const CertificateGenerator = require('../generators/certificateGenerator');
const fs = require('fs');
const path = require('path');
const PdfTemplate = require('../models/PdfTemplate');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

exports.generateInvoice = asyncHandler(async (req, res) => {
  const invoiceData = req.body;
  
  if (!invoiceData.invoiceNumber || !invoiceData.items || invoiceData.items.length === 0) {
    throw new ApiError('Invalid invoice data', 400);
  }

  const result = await InvoiceGenerator.generate(invoiceData);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

  const fileStream = fs.createReadStream(result.path);
  fileStream.pipe(res);
  
  fileStream.on('end', () => {
    // Optionally delete the file after sending
    fs.unlink(result.path, (err) => {
      if (err) logger.error('Error deleting temporary PDF:', err);
    });
  });
});

exports.generateFromTemplate = asyncHandler(async (req, res) => {
  const { templateId, data } = req.body;
  
  const template = await PdfTemplate.findById(templateId);
  if (!template) {
    throw new ApiError('Template not found', 404);
  }

  let result;
  switch (template.type) {
    case 'report':
      result = await ReportGenerator.generate(data, template);
      break;
    case 'certificate':
      result = await CertificateGenerator.generate(data, template);
      break;
    default:
      throw new ApiError('Unsupported template type', 400);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);

  const fileStream = fs.createReadStream(result.path);
  fileStream.pipe(res);
  
  fileStream.on('end', () => {
    fs.unlink(result.path, (err) => {
      if (err) logger.error('Error deleting temporary PDF:', err);
    });
  });
});

exports.createTemplate = asyncHandler(async (req, res) => {
  const { name, type, content, styles } = req.body;
  
  const template = await PdfTemplate.create({
    name,
    type,
    content,
    styles,
  });

  res.status(201).json({
    status: 'success',
    data: {
      template,
    },
  });
});

exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await PdfTemplate.find();

  res.status(200).json({
    status: 'success',
    results: templates.length,
    data: {
      templates,
    },
  });
});