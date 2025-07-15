#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

// A simple CLI tool to count words, lines, and characters in text files
const c = chalk.default || chalk;
const o = ora.default || ora;


// Common stop words to exclude
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
  'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'to', 'with'
]);

// Supported file extensions
const SUPPORTED_EXTENSIONS = new Set([
  '.txt', '.md', '.js', '.html', '.css', '.json', '.csv'
]);

function countWords(text, excludeStopWords = false) {
  const words = text
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .split(/\s+/)             // Split on whitespace
    .filter(word => word.length > 0); // Remove empty strings

  if (excludeStopWords) {
    return words.filter(word => !STOP_WORDS.has(word.toLowerCase())).length;
  }
  return words.length;
}

function countLines(text) {
  return text.split('\n').length;
}

function countCharacters(text) {
  return text.length;
}

async function processFile(filePath, options = {}) {
  const spinner = o(`Processing ${filePath}`).start();
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = {
      file: filePath,
      words: countWords(content, options.excludeStopWords),
      lines: countLines(content),
      characters: countCharacters(content)
    };
    
    spinner.succeed();
    return stats;
  } catch (error) {
    spinner.fail(`Error processing ${filePath}: ${error.message}`);
    return null;
  }
}

function isSupportedFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

async function processDirectory(dirPath, options = {}) {
  const results = [];
  const spinner = ora(`Scanning directory ${dirPath}`).start();
  
  try {
    const files = fs.readdirSync(dirPath);
    spinner.stop();
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && options.recursive) {
        const subResults = await processDirectory(fullPath, options);
        results.push(...subResults);
      } else if (stat.isFile() && isSupportedFile(fullPath)) {
        const fileStats = await processFile(fullPath, options);
        if (fileStats) results.push(fileStats);
      }
    }
    
    return results;
  } catch (error) {
    spinner.fail(`Error scanning directory ${dirPath}: ${error.message}`);
    return [];
  }
}

function displayResults(results, options = {}) {
  console.log('\n' + c.blue.bold('Word Count Results:'));
  
  let totalWords = 0;
  let totalLines = 0;
  let totalChars = 0;
  
  results.forEach(result => {
    console.log(c.green(`\nFile: ${result.file}`));
    console.log(`Words: ${result.words}`);
    console.log(`Lines: ${result.lines}`);
    console.log(`Characters: ${result.characters}`);
    
    totalWords += result.words;
    totalLines += result.lines;
    totalChars += result.characters;
  });
  
  if (results.length > 1) {
    console.log(c.yellow.bold('\nTotals:'));
    console.log(`Files processed: ${results.length}`);
    console.log(`Total words: ${totalWords}`);
    console.log(`Total lines: ${totalLines}`);
    console.log(`Total characters: ${totalChars}`);
  }
  
  if (options.excludeStopWords) {
    console.log(c.gray('\nNote: Common stop words were excluded from word count'));
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  const options = {
    recursive: args.includes('--recursive') || args.includes('-r'),
    excludeStopWords: args.includes('--no-stop-words') || args.includes('-n')
  };
  
  const paths = args.filter(arg => !arg.startsWith('-'));
  
  if (paths.length === 0) {
    console.log(c.red('Error: No file or directory specified'));
    showHelp();
    process.exit(1);
  }
  
  const allResults = [];
  
  for (const pathArg of paths) {
    try {
      const stat = fs.statSync(pathArg);
      
      if (stat.isFile() && isSupportedFile(pathArg)) {
        const result = await processFile(pathArg, options);
        if (result) allResults.push(result);
      } else if (stat.isDirectory()) {
        const results = await processDirectory(pathArg, options);
        allResults.push(...results);
      } else {
        console.log(c.yellow(`Skipping unsupported file: ${pathArg}`));
      }
    } catch (error) {
      console.log(c.red(`Error accessing ${pathArg}: ${error.message}`));
    }
  }
  
  if (allResults.length > 0) {
    displayResults(allResults, options);
  } else {
    console.log(c.yellow('No files were processed'));
  }
}

function showHelp() {
  console.log(c.blue.bold('\nWord Counter CLI\n'));
  console.log('Usage:');
  console.log('  word-counter <file|directory> [options]');
  console.log('  word-counter --help\n');
  console.log('Options:');
  console.log('  -r, --recursive      Scan directories recursively');
  console.log('  -n, --no-stop-words  Exclude common words from count');
  console.log('  --help               Show this help message\n');
  console.log('Examples:');
  console.log('  word-counter document.txt');
  console.log('  word-counter src/ -r');
  console.log('  word-counter . -n');
  console.log('  word-counter file1.txt file2.md docs/ -rn');
}

main().catch(console.error);