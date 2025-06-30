# 🕸️ Markdown to HTML Converter

A Node.js project that converts Markdown files to HTML documents. This tool is perfect for developers, technical writers, and content creators who want to transform their Markdown content into web-ready HTML with customizable templates and styling options.

## ✨ Features

- Core Conversion: Convert standard Markdown syntax to clean HTML
- File Processing: Process single files or entire directories
- Template Support: Use custom HTML templates for consistent styling
- Syntax Highlighting: Optional code block highlighting
- Front Matter Support: Extract YAML/JSON metadata from documents
- CLI Interface: Simple command-line interface for quick conversions
- API Mode: Programmatic access for integration with other tools
- Watch Mode: Automatically convert files when changes are detected
- Custom CSS: Inject custom stylesheets into the output
- Table of Contents: Auto-generate TOC from headings

## 🚀 Future Enhancements

- Plugin System: Allow extensions for custom markdown processors
- Live Preview: Web server with live-reload for previewing changes
- PDF Export: Add option to generate PDFs from the HTML output
- Theme Gallery: Collection of pre-made templates/themes
- Asset Handling: Better management of images and other media
- Multi-Format Output: Support for EPUB, DOCX, and other formats
- Performance Optimization: Faster processing for large document sets
- VSCode Extension: Integrate as a VSCode extension for seamless use
- GitHub Integration: Automatically sync with GitHub repositories
- SEO Optimization: Add meta tags and other SEO enhancements

## Project Structure

```bash
markdown-to-html/
├── bin/                 # CLI scripts
│   └── cli.js           # Command-line interface
├── lib/                 # Core functionality
│   ├── converter.js     # Main conversion logic
│   ├── template.js      # Template handling
│   ├── file-utils.js    # File operations
│   └── utils.js         # Helper functions
├── templates/           # Default HTML templates
│   ├── default.html
│   └── minimal.html
├── test/                # Test files
├── package.json
└── README.md
```