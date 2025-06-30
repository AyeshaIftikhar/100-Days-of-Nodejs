const fs = require('fs').promises;
const path = require('path');

class TemplateManager {
  constructor(templatesDir) {
    this.templatesDir = templatesDir;
    this.cache = {};
  }

  async getTemplate(name) {
    if (this.cache[name]) {
      return this.cache[name];
    }

    const templatePath = path.join(this.templatesDir, `${name}.html`);
    try {
      const content = await fs.readFile(templatePath, 'utf8');
      this.cache[name] = content;
      return content;
    } catch (error) {
      throw new Error(`Template "${name}" not found: ${error.message}`);
    }
  }

  async listTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      return files
        .filter(file => path.extname(file) === '.html')
        .map(file => path.basename(file, '.html'));
    } catch (error) {
      throw new Error(`Failed to list templates: ${error.message}`);
    }
  }
}

module.exports = TemplateManager;