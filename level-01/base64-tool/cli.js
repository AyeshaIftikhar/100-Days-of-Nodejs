#!/usr/bin/env node
const { program } = require('commander');
const Base64Encoder = require('./lib/encoder');
const FileHandler = require('./lib/fileHandler');

program
  .name('base64-tool')
  .description('CLI tool for Base64 encoding/decoding')
  .version('1.0.0');

program.command('encode <input>')
  .description('Encode a string or file to Base64')
  .option('-o, --output <path>', 'Output file path')
  .option('-u, --url-safe', 'Use URL-safe encoding')
  .option('-f, --file', 'Treat input as file path')
  .action(async (input, options) => {
    try {
      let result;
      if (options.file) {
        result = await FileHandler.encodeFile(input, options.output, options.urlSafe);
      } else {
        result = Base64Encoder.encode(input, options.urlSafe);
      }
      console.log(result);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.command('decode <input>')
  .description('Decode a Base64 string or file')
  .option('-o, --output <path>', 'Output file path')
  .option('-u, --url-safe', 'Use URL-safe decoding')
  .option('-f, --file', 'Treat input as file path')
  .action(async (input, options) => {
    try {
      let result;
      if (options.file) {
        result = await FileHandler.decodeFile(input, options.output, options.urlSafe);
      } else {
        result = Base64Encoder.decode(input, options.urlSafe);
      }
      console.log(result);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse();