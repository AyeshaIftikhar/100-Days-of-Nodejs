# CLI SQL Query Runner (`sqlr`)

A cross-database **command‑line SQL runner** for **SQLite**, **PostgreSQL**, and **MySQL**.  
Run one‑off queries, pipe SQL from files/stdin, or drop into an interactive REPL.  
Get results as **table**, **JSON**, or **CSV**. Opt‑in **transactions** and **read‑only** safety.

## Why this solves a real problem

Devs and data folks constantly need to:
- Test queries quickly without opening a heavy GUI.
- Run SQL as part of shell scripts/cron jobs.
- Inspect production incidents in read‑only mode.
- Export quick CSV/JSON snapshots.

`sqlr` gives you a single, ergonomic CLI that works across popular databases.

---

## Quick Start

```bash
# 1) Download the project
git clone <your-fork-or-zip> && cd cli-sql-query-runner

# 2) Install deps (pick the drivers you need)
npm install

# 3) Copy env and adjust
cp .env.example .env

# 4) Make the CLI executable (optional)
chmod +x bin/sqlr.js

# 5) Try SQLite demo
mkdir -p data
node -e "require('fs').writeFileSync('data/dev.sqlite','')" # create empty file (sqlite will init)
npm start -- --driver sqlite --file examples/sample.sql
```

## Usage

```bash
sqlr [options]

Options:
  -d, --driver       sqlite | postgres | mysql
  --env              load .env (default true)
  -h, --host         database host
  -P, --port         database port
  -u, --user         username
  -p, --password     password (or use env)
  -D, --database     database name (pg/mysql)
  --file             path to a .sql file to execute
  -q, --query        SQL string to execute (quote it)
  --stdin            read SQL from STDIN
  --readonly         open in read-only mode (best-effort for pg/mysql)
  --transaction      wrap statements in a transaction
  -f, --format       table | json | csv (default: env OUTPUT_FORMAT or table)
  -o, --output       write results to a file (csv|json use extension)
  --no-color         disable colors
  -v, --verbose      extra logs
  --help             show help
  --version          show version
```

### Examples

```bash
# Query a SQLite file (table output)
sqlr -d sqlite --file examples/sample.sql

# Inline query against Postgres
sqlr -d postgres -h 127.0.0.1 -P 5432 -u postgres -p secret -D mydb -q "select now();"

# Pipe SQL from stdin and emit CSV
echo "select 1 id, 'hello' msg" | sqlr -d sqlite --stdin -f csv > out.csv

# Read‑only check (Postgres)
sqlr -d postgres -D mydb -u app -p *** --readonly -q "select count(*) from users;"

# Interactive REPL (end statements with ;, exit with \q)
sqlr -d sqlite --repl
```

## Configuration

Copy `.env.example` to `.env` and adjust. All flags can also be set via env:

- `DB_DRIVER`: `sqlite|postgres|mysql`
- SQLite: `SQLITE_FILE`
- Postgres: `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, `PG_SSL`
- MySQL: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- Default output: `OUTPUT_FORMAT=table|json|csv`

CLI flags always override `.env`.

## Development

```bash
npm install
npm run dev
```

## Future Enhancements

- Saved **profiles** (e.g., `--profile prod`) in `~/.sqlr.json`
- **Parameterized queries** with `:name` bindings
- **Connection pooling** and multi‑statement scripts with error continue/stop
- **Timing & EXPLAIN** helpers (`--time`, `--explain`)
- **Pretty printing** wide tables with smart truncation
- **Drivers** for MSSQL, Snowflake, DuckDB
- **.sqlr scripts**: variables, include files, conditionals

## License
MIT