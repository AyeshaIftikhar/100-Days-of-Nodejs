const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const hljs = require('highlight.js');
const frontMatter = require('front-matter');

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    }
    return hljs.highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

class MarkdownConverter {
  constructor(options = {}) {
    this.options = {
      template: path.join(__dirname, '../templates/default.html'),
      outputDir: process.cwd(),
      ...options
    };
  }

  async convertFile(inputPath) {
    try {
      // Validate input path
      if (!inputPath) throw new Error('Input path is required');
      
      // Read and parse markdown
      const markdown = await fs.readFile(inputPath, 'utf8');
      const { attributes: metadata, body } = frontMatter(markdown);
      
      // Convert to HTML
      const contentHtml = marked.parse(body);
      
      // Apply template
      const template = await this._loadTemplate();
      const fullHtml = this._applyTemplate(template, {
        title: metadata.title || path.basename(inputPath, '.md'),
        content: contentHtml,
        metadata,
        date: new Date().toISOString()
      });
      
      // Determine output path
      const outputPath = this._getOutputPath(inputPath);
      
      // Write output
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, fullHtml);
      
      return {
        inputPath,
        outputPath,
        metadata,
        contentHtml
      };
    } catch (error) {
      throw new Error(`Failed to convert ${inputPath}: ${error.message}`);
    }
  }

  async _loadTemplate() {
    try {
      return await fs.readFile(this.options.template, 'utf8');
    } catch (error) {
      throw new Error(`Template loading failed: ${error.message}`);
    }
  }

  _applyTemplate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || '';
    });
  }

  _getOutputPath(inputPath) {
    const basename = path.basename(inputPath, path.extname(inputPath));
    return path.join(
      this.options.outputDir,
      `${basename}.html`
    );
  }
}

module.exports = MarkdownConverter;