#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const inquirer = require('inquirer');

const c = chalk.default || chalk;

// Character sets
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Color themes
const styles = {
  title: c.bold.cyan,
  success: c.green,
  warning: c.yellow,
  error: c.red,
  password: c.bold,
  highlight: c.cyan.bold,
  muted: c.dim
};

// Display banner
function displayBanner() {
  console.log(styles.title(`
  ██████╗  █████╗ ███████╗███████╗ ██████╗ ███████╗███╗   ██╗
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝ ██╔════╝████╗  ██║
  ██████╔╝███████║███████╗███████╗██║  ███╗█████╗  ██╔██╗ ██║
  ██╔═══╝ ██╔══██║╚════██║╚════██║██║   ██║██╔══╝  ██║╚██╗██║
  ██║     ██║  ██║███████║███████║╚██████╔╝███████╗██║ ╚████║
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝
  `));
  console.log(styles.muted(`  Secure Password Generator v1.0.0\n`));
}

// Main password generation function
function generatePassword(options) {
  let chars = '';
  if (options.lowercase) chars += LOWER;
  if (options.uppercase) chars += UPPER;
  if (options.numbers) chars += NUMBERS;
  if (options.symbols) chars += SYMBOLS;

  return Array.from(crypto.randomFillSync(new Uint32Array(options.length)))
    .map((x) => chars[x % chars.length])
    .join('');
}

// Interactive menu
async function mainMenu() {
  displayBanner();

  const answers = await inquirer.default.prompt([
    {
      type: 'number',
      name: 'length',
      message: 'Password length (4-1024):',
      default: 16,
      validate: (input) => {
        if (input >= 4 && input <= 1024) return true;
        return 'Please enter a number between 4 and 1024';
      }
    },
    {
      type: 'checkbox',
      name: 'characterTypes',
      message: 'Select character types to include:',
      choices: [
        { name: 'Lowercase letters (abc...)', value: 'lowercase', checked: true },
        { name: 'Uppercase letters (ABC...)', value: 'uppercase', checked: true },
        { name: 'Numbers (123...)', value: 'numbers', checked: true },
        { name: 'Symbols (!@#...)', value: 'symbols', checked: true }
      ],
      validate: (input) => {
        if (input.length === 0) return 'You must select at least one character type';
        return true;
      }
    },
    {
      type: 'number',
      name: 'count',
      message: 'Number of passwords to generate (1-20):',
      default: 1,
      validate: (input) => {
        if (input >= 1 && input <= 20) return true;
        return 'Please enter a number between 1 and 20';
      }
    },
    {
      type: 'confirm',
      name: 'copy',
      message: 'Copy first password to clipboard?',
      default: true
    },
    {
      type: 'confirm',
      name: 'saveToFile',
      message: 'Save passwords to a file?',
      default: false
    },
    {
      type: 'input',
      name: 'outputFile',
      message: 'File path to save passwords:',
      when: (answers) => answers.saveToFile,
      validate: (input) => {
        if (input.trim().length === 0) return 'Please enter a valid file path';
        return true;
      }
    }
  ]);

  // Process character types
  const options = {
    length: answers.length,
    lowercase: answers.characterTypes.includes('lowercase'),
    uppercase: answers.characterTypes.includes('uppercase'),
    numbers: answers.characterTypes.includes('numbers'),
    symbols: answers.characterTypes.includes('symbols')
  };

  // Generate passwords
  const passwords = [];
  for (let i = 0; i < answers.count; i++) {
    passwords.push(generatePassword(options));
  }

  // Display results
  console.log('\n' + styles.highlight('Generated Password(s):'));
  passwords.forEach((pwd, i) => {
    console.log(styles.muted(`${i + 1}.`), styles.password(pwd));
  });

  // Copy to clipboard
  if (answers.copy && passwords.length > 0) {
    try {
      clipboardy.writeSync(passwords[0]);
      console.log(styles.success('\n✓ First password copied to clipboard'));
    } catch (err) {
      console.error(styles.error('\n✗ Failed to copy to clipboard:'), err.message);
    }
  }

  // Save to file
  if (answers.saveToFile && answers.outputFile) {
    try {
      const content = passwords.join('\n') + '\n';
      fs.writeFileSync(answers.outputFile, content, { mode: 0o600 });
      console.log(styles.success(`✓ Passwords saved to ${answers.outputFile}`));
    } catch (err) {
      console.error(styles.error('✗ Failed to save passwords:'), err.message);
    }
  }

  // Show configuration summary
  console.log('\n' + styles.highlight('Configuration Used:'));
  console.log(styles.muted(`  Length: ${options.length}`));
  console.log(styles.muted(`  Lowercase: ${options.lowercase ? '✓' : '✗'}`));
  console.log(styles.muted(`  Uppercase: ${options.uppercase ? '✓' : '✗'}`));
  console.log(styles.muted(`  Numbers: ${options.numbers ? '✓' : '✗'}`));
  console.log(styles.muted(`  Symbols: ${options.symbols ? '✓' : '✗'}`));

  // Ask to generate another
  const { again } = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'again',
      message: 'Generate another password?',
      default: false
    }
  ]);

  if (again) {
    console.clear();
    mainMenu();
  } else {
    console.log(styles.success('\nThank you for using Password Generator!'));
  }
}

// Start the application
mainMenu().catch(console.error);