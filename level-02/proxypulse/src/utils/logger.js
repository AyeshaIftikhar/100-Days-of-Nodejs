import chalk from 'chalk';

export const log = {
  info: (msg, ...args) => console.log(chalk.cyan('ℹ'), chalk.white(msg), ...args),
  ok:   (msg, ...args) => console.log(chalk.green('✔'), chalk.white(msg), ...args),
  warn: (msg, ...args) => console.log(chalk.yellow('⚠'), chalk.white(msg), ...args),
  err:  (msg, ...args) => console.error(chalk.red('✖'), chalk.white(msg), ...args),
  title:(msg, ...args) => console.log('\n' + chalk.bold.magenta(msg), ...args),
};
