const EmailService = require('../services/emailService');
// In emailController.js
const EmailTemplate = require('../models/EmailTemplate');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

exports.sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, template, context, scheduled } = req.body;

  const email = await EmailService.sendEmail({
    to,
    subject,
    template,
    context,
    scheduled: scheduled ? new Date(scheduled) : null,
  });

  res.status(200).json({
    status: 'success',
    data: {
      email,
    },
  });
});

exports.sendBulkEmails = asyncHandler(async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    throw new ApiError('Please provide an array of emails', 400);
  }

  const results = await EmailService.sendBulk(emails);

  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});

exports.createTemplate = asyncHandler(async (req, res) => {
  const { name, subject, html, text, variables } = req.body;

  const template = await EmailTemplate.create({
    name,
    subject,
    html,
    text,
    variables,
  });

  res.status(201).json({
    status: 'success',
    data: {
      template,
    },
  });
});

exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await EmailTemplate.find();

  res.status(200).json({
    status: 'success',
    results: templates.length,
    data: {
      templates,
    },
  });
});