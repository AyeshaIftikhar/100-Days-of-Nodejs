const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const EmailTemplate = require('../models/EmailTemplate');
const logger = require('../utils/logger');

// Register custom helpers
handlebars.registerHelper('capitalize', (str) => {
  if (typeof str === 'string') {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
});

async function compileTemplate(templateName, context) {
  try {
    // Try to get template from database first
    let template = await EmailTemplate.findOne({ name: templateName });
    
    if (!template) {
      // Fallback to filesystem
      const templatePath = path.join(__dirname, `../../templates/${templateName}.hbs`);
      const source = await fs.readFile(templatePath, 'utf8');
      template = { html: source, text: source };
    }

    const htmlCompiler = handlebars.compile(template.html);
    const textCompiler = handlebars.compile(template.text || template.html);

    return {
      html: htmlCompiler(context),
      text: textCompiler(context),
    };
  } catch (error) {
    logger.error(`Template compilation failed for ${templateName}: ${error.message}`);
    throw new Error(`Template ${templateName} not found or invalid`);
  }
}

module.exports = { compileTemplate };