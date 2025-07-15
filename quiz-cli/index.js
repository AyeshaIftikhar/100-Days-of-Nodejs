#!/usr/bin/env node
const Quizzer = require('./lib/quizzer');
const chalk = require('chalk');

async function main() {
  try {
    const quizzer = new Quizzer();
    await quizzer.start();
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error.message);
    process.exit(1);
  }
}

main();