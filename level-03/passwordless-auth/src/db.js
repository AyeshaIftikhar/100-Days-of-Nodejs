import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  ip TEXT,
  ua TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS email_counters (
  email TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  day TEXT NOT NULL
);
`);

export function getOrCreateUserByEmail(email) {
  const get = db.prepare('SELECT * FROM users WHERE email = ?');
  let user = get.get(email);
  if (!user) {
    const ins = db.prepare('INSERT INTO users (email) VALUES (?)');
    const info = ins.run(email);
    user = { id: info.lastInsertRowid, email };
  }
  return user;
}

export const queries = {
  insertLoginToken: db.prepare(`INSERT INTO login_tokens (user_id, token, code, ip, ua, expires_at) VALUES (?, ?, ?, ?, ?, ?)`),
  findToken: db.prepare(`SELECT * FROM login_tokens WHERE token = ?`),
  consumeToken: db.prepare(`UPDATE login_tokens SET consumed_at = datetime('now') WHERE id = ?`),
  countEmailToday: db.prepare(`SELECT count, day FROM email_counters WHERE email = ?`),
  upsertEmailCounter: db.prepare(`INSERT INTO email_counters (email, count, day) VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET count = excluded.count, day = excluded.day`)
};
