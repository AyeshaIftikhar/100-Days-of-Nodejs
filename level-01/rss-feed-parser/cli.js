#!/usr/bin/env node
const { Command } = require('commander');
const RSSParser = require('./parser');
const chalk = require('chalk');
const Table = require('cli-table3');

const c = chalk.default || chalk;

const program = new Command();
const parser = new RSSParser();

program
  .name('rss-parser')
  .description('CLI tool to parse and display RSS feeds')
  .version('1.0.0');

program.command('parse')
  .description('Parse an RSS feed')
  .requiredOption('-u, --url <url>', 'RSS feed URL')
  .option('-l, --limit <number>', 'Limit number of items', parseInt)
  .option('-s, --since <date>', 'Only show items since date (YYYY-MM-DD)')
  .option('--until <date>', 'Only show items until date (YYYY-MM-DD)')
  .option('-c, --category <category>', 'Filter by category')
  .option('--search <query>', 'Search in title and description')
  .option('--sort <type>', 'Sort by "newest" or "oldest"')
  .action(async (options) => {
    try {
      console.log(c.blue(`\nFetching RSS feed from ${options.url}...`));
      
      const items = await parser.parseFeed(options.url, {
        limit: options.limit,
        since: options.since,
        until: options.until,
        category: options.category,
        search: options.search,
        sort: options.sort
      });

      if (items.length === 0) {
        console.log(c.yellow('No items found matching your criteria.'));
        return;
      }

      // Display results in a table
      const table = new Table({
        head: [
          c.white.bold('Title'), 
         c.white.bold('Date'), 
          c.white.bold('Author')
        ],
        colWidths: [40, 20, 20],
        wordWrap: true
      });

      items.forEach(item => {
        table.push([
         c.blue(item.title),
          item.pubDate.toLocaleDateString(),
          item.author || 'N/A'
        ]);
      });

      console.log(table.toString());
      console.log(c.green(`\nFound ${items.length} items.`));

    } catch (error) {
      console.error(c.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);