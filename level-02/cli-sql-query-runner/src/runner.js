import fs from 'node:fs';
import path from 'node:path';

export async function connect(opts) {
  const driver = (opts.driver || '').toLowerCase();
  if (driver === 'sqlite') {
    const sqlite3 = await import('sqlite3');
    const sqlite = sqlite3.default.verbose();
    const file = opts.sqliteFile || process.env.SQLITE_FILE || './data/dev.sqlite';
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    const mode = opts.readonly ? sqlite.OPEN_READONLY : sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE;
    const db = new sqlite.Database(file, mode);
    const runAll = (sql) => new Promise((resolve, reject) => {
      const statements = splitStatements(sql);
      const results = [];
      const execNext = (i) => {
        if (i >= statements.length) return resolve(results);
        const s = statements[i];
        if (!s.trim()) return execNext(i + 1);
        if (/^\s*select\b/i.test(s)) {
          db.all(s, (err, rows) => {
            if (err) return reject(err);
            results.push({ type: 'rows', rows });
            execNext(i + 1);
          });
        } else {
          db.run(s, function(err) {
            if (err) return reject(err);
            results.push({ type: 'ok', changes: this.changes, lastID: this.lastID });
            execNext(i + 1);
          });
        }
      };
      execNext(0);
    });
    const close = () => new Promise((res, rej) => db.close(err => err ? rej(err) : res()));
    return { driver, query: runAll, close };
  }
  if (driver === 'postgres') {
    const { Client } = await import('pg');
    const client = new Client({
      host: opts.host || process.env.PG_HOST || '127.0.0.1',
      port: Number(opts.port || process.env.PG_PORT || 5432),
      user: opts.user || process.env.PG_USER,
      password: opts.password || process.env.PG_PASSWORD,
      database: opts.database || process.env.PG_DATABASE,
      ssl: /^true$/i.test(String(process.env.PG_SSL || 'false')) ? { rejectUnauthorized: false } : undefined
    });
    await client.connect();
    const runAll = async (sql) => {
      const statements = splitStatements(sql);
      const results = [];
      let tx = false;
      if (opts.transaction) {
        tx = true;
        await client.query('BEGIN');
      }
      try {
        for (const s of statements) {
          if (!s.trim()) continue;
          const r = await client.query(s);
          if (Array.isArray(r.rows)) {
            results.push({ type: 'rows', rows: r.rows });
          } else {
            results.push({ type: 'ok', rowCount: r.rowCount });
          }
        }
        if (tx) await client.query(opts.readonly ? 'ROLLBACK' : 'COMMIT');
      } catch (e) {
        if (tx) await client.query('ROLLBACK');
        throw e;
      }
      return results;
    };
    const close = () => client.end();
    return { driver, query: runAll, close };
  }
  if (driver === 'mysql') {
    const mysql = await import('mysql2/promise');
    const conn = await mysql.createConnection({
      host: opts.host || process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(opts.port || process.env.MYSQL_PORT || 3306),
      user: opts.user || process.env.MYSQL_USER,
      password: opts.password || process.env.MYSQL_PASSWORD,
      database: opts.database || process.env.MYSQL_DATABASE
    });
    const runAll = async (sql) => {
      const statements = splitStatements(sql);
      const results = [];
      let tx = false;
      if (opts.transaction) {
        tx = true;
        await conn.beginTransaction();
      }
      try {
        for (const s of statements) {
          if (!s.trim()) continue;
          const [rows, meta] = await conn.query(s);
          if (Array.isArray(rows)) {
            results.push({ type: 'rows', rows });
          } else {
            results.push({ type: 'ok', affectedRows: rows?.affectedRows ?? meta?.affectedRows });
          }
        }
        if (tx) {
          if (opts.readonly) await conn.rollback();
          else await conn.commit();
        }
      } catch (e) {
        if (tx) await conn.rollback();
        throw e;
      }
      return results;
    };
    const close = () => conn.end();
    return { driver, query: runAll, close };
  }
  throw new Error(`Unknown driver: ${driver}. Use sqlite|postgres|mysql`);
}

export function splitStatements(sql) {
  // simple split on semicolons that are not inside single/double quotes
  const statements = [];
  let current = '';
  let inSQ = false, inDQ = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && !inDQ) {
      if (sql[i-1] !== '\\') inSQ = !inSQ;
      current += ch;
    } else if (ch === '"' && !inSQ) {
      if (sql[i-1] !== '\\') inDQ = !inDQ;
      current += ch;
    } else if (ch === ';' && !inSQ && !inDQ) {
      statements.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current);
  return statements;
}