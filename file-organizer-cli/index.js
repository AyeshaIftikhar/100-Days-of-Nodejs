#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // For colored console output
const { program } = require('commander'); // CLI argument parser

const c = chalk.default || chalk;

// Load default extension mappings
const DEFAULT_MAPPINGS = require('./config/default.json');

// Initialize CLI
program
  .version('1.0.0')
  .description('Automatically organize files by extension')
  .option('-d, --dir <path>', 'Target directory', './test-files')
  .option('-m, --map <path>', 'Custom extension mappings file')
  .option('--dry', 'Dry run (show changes without moving)')
  .parse(process.argv);

// Main function
async function organizeFiles() {
  try {
    const { dir, map, dry } = program.opts();
    
    // 1. Load mappings
    const mappings = map 
      ? JSON.parse(fs.readFileSync(path.resolve(map)))
      : DEFAULT_MAPPINGS;

    // 2. Validate directory
    const targetDir = path.resolve(dir);
    if (!fs.existsSync(targetDir)) {
      throw new Error(`Directory not found: ${targetDir}`);
    }

    console.log(c.blue(`\nOrganizing: ${targetDir}\n`));

    // 3. Scan directory
    const files = fs.readdirSync(targetDir).filter(file => {
      const fullPath = path.join(targetDir, file);
      return fs.statSync(fullPath).isFile();
    });

    let movedFiles = 0;
    let skippedFiles = 0;

    // 4. Process each file
    for (const file of files) {
      const ext = path.extname(file).slice(1).toLowerCase();
      const oldPath = path.join(targetDir, file);

      // Find matching category
      const category = Object.keys(mappings).find(key =>
        mappings[key].includes(ext)
      );

      if (!category) {
        console.log(c.gray(`⏩ Skipped ${file} (unknown extension)`));
        skippedFiles++;
        continue;
      }

      // Create category folder if needed
      const categoryDir = path.join(targetDir, category);
      if (!fs.existsSync(categoryDir)) {
        if (!dry) fs.mkdirSync(categoryDir);
        console.log(c.yellow(`📁 Created /${category} folder`));
      }

      // Handle filename conflicts
      let newFilename = file;
      let newPath = path.join(categoryDir, newFilename);
      let counter = 1;

      while (fs.existsSync(newPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        newFilename = `${path.parse(file).name}_${timestamp}${path.extname(file)}`;
        newPath = path.join(categoryDir, newFilename);
        counter++;
      }

      // Execute move
      if (dry) {
        console.log(c.cyan(`ℹ️ Would move ${file} → ${category}/${newFilename}`));
      } else {
        fs.renameSync(oldPath, newPath);
        console.log(c.green(`✅ Moved ${file} → ${category}/${newFilename}`));
        movedFiles++;
      }
    }

    // 5. Print summary
    console.log(c.bold(`\nResults:`));
    console.log(c(`📂 Files scanned: ${files.length}`));
    console.log(c(`🚀 Files moved: ${movedFiles}`));
    console.log(c(`⏭️ Files skipped: ${skippedFiles}`));
    if (dry) console.log(c.bold.yellow('\n⚠️ DRY RUN: No files were actually moved'));

  } catch (error) {
    console.error(c.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

organizeFiles();