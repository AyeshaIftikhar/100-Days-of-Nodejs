import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from './database';
import { AttendanceLog } from '../types';

export class AttendanceModel {
  static async create(attendanceData: Omit<AttendanceLog, 'id' | 'timestamp'>): Promise<AttendanceLog> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await dbRun(
      `INSERT INTO attendance_logs (id, user_id, type, timestamp, confidence, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        attendanceData.userId,
        attendanceData.type,
        timestamp,
        attendanceData.confidence || null,
        attendanceData.imageUrl || null,
      ]
    );

    return this.findById(id) as Promise<AttendanceLog>;
  }

  static async findById(id: string): Promise<AttendanceLog | null> {
    const row = await dbGet('SELECT * FROM attendance_logs WHERE id = ?', [id]);
    return row ? this.mapRowToAttendanceLog(row) : null;
  }

  static async findByUserId(userId: string, limit?: number): Promise<AttendanceLog[]> {
    let query = 'SELECT * FROM attendance_logs WHERE user_id = ? ORDER BY timestamp DESC';
    const params: any[] = [userId];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const rows = await dbAll(query, params);
    return rows.map(row => this.mapRowToAttendanceLog(row));
  }

  static async findAll(limit?: number, offset?: number): Promise<AttendanceLog[]> {
    let query = 'SELECT * FROM attendance_logs ORDER BY timestamp DESC';
    const params: any[] = [];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);

      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const rows = await dbAll(query, params);
    return rows.map(row => this.mapRowToAttendanceLog(row));
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<AttendanceLog[]> {
    const rows = await dbAll(
      'SELECT * FROM attendance_logs WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate.toISOString(), endDate.toISOString()]
    );
    return rows.map(row => this.mapRowToAttendanceLog(row));
  }

  static async getLastAttendanceByUser(userId: string): Promise<AttendanceLog | null> {
    const row = await dbGet(
      'SELECT * FROM attendance_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );
    return row ? this.mapRowToAttendanceLog(row) : null;
  }

  static async getTodayAttendanceByUser(userId: string): Promise<AttendanceLog[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.findByDateRange(startOfDay, endOfDay);
  }

  static async getAttendanceStats(startDate?: Date, endDate?: Date): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT user_id) as unique_users,
        SUM(CASE WHEN type = 'checkin' THEN 1 ELSE 0 END) as checkins,
        SUM(CASE WHEN type = 'checkout' THEN 1 ELSE 0 END) as checkouts
      FROM attendance_logs
    `;
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE timestamp BETWEEN ? AND ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    }

    const row = await dbGet(query, params);
    return row;
  }

  private static mapRowToAttendanceLog(row: any): AttendanceLog {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as 'checkin' | 'checkout',
      timestamp: new Date(row.timestamp),
      confidence: row.confidence,
      imageUrl: row.image_url,
    };
  }
}
