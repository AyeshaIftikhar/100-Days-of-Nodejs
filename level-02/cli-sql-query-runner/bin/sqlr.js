#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { connect } from '../src/runner.js';
import { emit } from '../src/format.js';
import { startRepl } from '../src/repl.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const argv = yargs(hideBin(process.argv))
  .scriptName('sqlr')
  .option('driver', { alias: 'd', type: 'string', describe: 'sqlite | postgres | mysql' })
  .option('env', { type: 'boolean', default: true, describe: 'load .env file' })
  .option('host', { alias: 'h', type: 'string' })
  .option('port', { alias: 'P', type: 'number' })
  .option('user', { alias: 'u', type: 'string' })
  .option('password', { alias: 'p', type: 'string' })
  .option('database', { alias: 'D', type: 'string' })
  .option('sqliteFile', { type: 'string', describe: 'Path to SQLite file (SQLITE_FILE env also works)' })
  .option('query', { alias: 'q', type: 'string', describe: 'Inline SQL to execute' })
  .option('file', { type: 'string', describe: 'Path to a .sql file to execute' })
  .option('stdin', { type: 'boolean', describe: 'Read SQL from STDIN' })
  .option('repl', { type: 'boolean', describe: 'Interactive mode' })
  .option('readonly', { type: 'boolean', default: false, describe: 'Best-effort read-only (tx rollback for pg/mysql)' })
  .option('transaction', { type: 'boolean', default: false, describe: 'Wrap statements in a transaction' })
  .option('format', { alias: 'f', type: 'string', default: process.env.OUTPUT_FORMAT || 'table', choices: ['table','json','csv'] })
  .option('output', { alias: 'o', type: 'string', describe: 'Write output to a file' })
  .option('verbose', { alias: 'v', type: 'boolean', default: false })
  .help()
  .version()
  .parse();

if (argv.env) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

async function main() {
  const driver = argv.driver || process.env.DB_DRIVER;
  if (!driver) {
    console.error('Error: missing --driver (sqlite|postgres|mysql) or DB_DRIVER env');
    process.exit(1);
  }

  if (argv.repl && (argv.query || argv.file || argv.stdin)) {
    console.error('Error: --repl cannot be combined with --query/--file/--stdin');
    process.exit(1);
  }

  const conn = await connect({
    driver,
    host: argv.host,
    port: argv.port,
    user: argv.user,
    password: argv.password,
    database: argv.database,
    sqliteFile: argv.sqliteFile,
    readonly: argv.readonly,
    transaction: argv.transaction
  });

  try {
    if (argv.repl || (!argv.query && !argv.file && !argv.stdin)) {
      await startRepl(conn, argv.format);
      await conn.close();
      process.exit(0);
    }

    let sql = '';
    if (argv.query) sql = argv.query;
    else if (argv.file) sql = fs.readFileSync(path.resolve(argv.file), 'utf8');
    else if (argv.stdin) sql = fs.readFileSync(0, 'utf8'); // read from STDIN
    else {
      console.error('Provide one of --query, --file, or --stdin (or use --repl).');
      process.exit(1);
    }

    const results = await conn.query(sql);
    let printedAny = false;
    for (const r of results) {
      if (r.type === 'rows') {
        const out = emit(r.rows, argv.format, argv.output);
        if (!argv.output) console.log(out);
        printedAny = true;
      } else {
        if (!argv.output) console.log(JSON.stringify(r));
      }
    }
    if (!printedAny && !argv.output) {
      console.log('(ok)');
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    await conn.close();
  }
}

main();