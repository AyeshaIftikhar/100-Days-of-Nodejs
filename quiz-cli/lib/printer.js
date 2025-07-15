const chalk = require('chalk');

module.exports = {
  title: (text) => console.log(chalk.blue.bold(`\n${text}`)),
  question: (text, time) => {
    const timer = time ? chalk.gray(` [${time}s]`) : '';
    console.log(chalk.yellow.bold(`\n${text}${timer}`));
  },
  option: (index, text) => console.log(chalk.cyan(`${index}. ${text}`)),
  correct: (text) => console.log(chalk.green(`✓ ${text}`)),
  incorrect: (text) => console.log(chalk.red(`✗ ${text}`)),
  info: (text) => console.log(chalk.blue(text)),
  error: (text) => console.log(chalk.red(text)),
  score: (correct, total) => {
    const percentage = Math.round((correct / total) * 100);
    let color = chalk.red;
    if (percentage > 60) color = chalk.yellow;
    if (percentage > 80) color = chalk.green;
    
    console.log(
      chalk.bold(`\nYour score: `) + 
      color(`${correct}/${total} (${percentage}%)`)
    );
  }
};