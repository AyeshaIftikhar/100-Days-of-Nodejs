#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const chalk = require('chalk');
const MarkdownConverter = require('../lib/converter');
const FileUtils = require('../lib/file-utils');

const c = chalk.default || chalk;

program
  .name('md2html')
  .description('Convert Markdown files to HTML')
  .version('1.0.0')
  .argument('<input>', 'Markdown file or directory')
  .option('-o, --output <dir>', 'Output directory', process.cwd())
  .option('-t, --template <name>', 'Template name to use', 'default')
  .option('-w, --watch', 'Watch for changes and auto-convert')
  .option('-v, --verbose', 'Show detailed output');

program.parse(process.argv);

async function main() {
  const options = program.opts();
  const inputPath = program.args[0];
  
  try {
    const converter = new MarkdownConverter({
      template: path.join(__dirname, '../templates', `${options.template}.html`),
      outputDir: options.output
    });

    const stats = await fs.promises.stat(inputPath);
    
    if (stats.isFile()) {
      await convertSingleFile(inputPath, converter, options);
    } else if (stats.isDirectory()) {
      await convertDirectory(inputPath, converter, options);
    }

    if (options.watch) {
      startWatching(inputPath, converter, options);
    }
  } catch (error) {
    console.error(c.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function convertSingleFile(inputPath, converter, options) {
  if (options.verbose) {
    console.log(c.gray(`Converting ${inputPath}...`));
  }
  
  const result = await converter.convertFile(inputPath);
  
  if (options.verbose) {
    console.log(c.green(`Successfully created ${result.outputPath}`));
  }
}

async function convertDirectory(inputPath, converter, options) {
  const markdownFiles = await FileUtils.findMarkdownFiles(inputPath);
  
  if (options.verbose) {
    console.log(c.gray(`Found ${markdownFiles.length} markdown files to convert`));
  }
  
  for (const file of markdownFiles) {
    await convertSingleFile(file, converter, options);
  }
}

function startWatching(inputPath, converter, options) {
  const chokidar = require('chokidar');
  
  console.log(c.blue(`Watching for changes in ${inputPath}...`));
  
  const watcher = chokidar.watch(inputPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true
  });

  watcher
    .on('add', path => handleChange(path, 'added'))
    .on('change', path => handleChange(path, 'changed'))
    .on('unlink', path => console.log(c.gray(`${path} removed`)));

  async function handleChange(filePath, action) {
    if (path.extname(filePath) !== '.md') return;
    
    if (options.verbose) {
      console.log(c.gray(`${filePath} ${action}`));
    }
    
    try {
      await convertSingleFile(filePath, converter, options);
    } catch (error) {
      console.error(c.red(`Error processing ${filePath}: ${error.message}`));
    }
  }
}

main();