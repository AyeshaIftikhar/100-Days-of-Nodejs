import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/facial_recognition.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

// Promisify database methods
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        employee_id TEXT UNIQUE,
        department TEXT,
        face_descriptor TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create attendance_logs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('checkin', 'checkout')),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        confidence REAL,
        image_url TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_logs(user_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance_logs(timestamp)`);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export { db };
