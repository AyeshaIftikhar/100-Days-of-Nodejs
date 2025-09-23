import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from './database';
import { User } from '../types';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const faceDescriptorString = userData.faceDescriptor 
      ? JSON.stringify(userData.faceDescriptor)
      : null;

    await dbRun(
      `INSERT INTO users (id, name, email, employee_id, department, face_descriptor, image_url, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.name,
        userData.email,
        userData.employeeId || null,
        userData.department || null,
        faceDescriptorString,
        userData.imageUrl || null,
        userData.isActive ? 1 : 0,
        now,
        now,
      ]
    );

    return this.findById(id) as Promise<User>;
  }

  static async findById(id: string): Promise<User | null> {
    const row = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapRowToUser(row) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const row = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    return row ? this.mapRowToUser(row) : null;
  }

  static async findByEmployeeId(employeeId: string): Promise<User | null> {
    const row = await dbGet('SELECT * FROM users WHERE employee_id = ?', [employeeId]);
    return row ? this.mapRowToUser(row) : null;
  }

  static async findAll(isActive?: boolean): Promise<User[]> {
    let query = 'SELECT * FROM users';
    const params: any[] = [];

    if (isActive !== undefined) {
      query += ' WHERE is_active = ?';
      params.push(isActive ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await dbAll(query, params);
    return rows.map(row => this.mapRowToUser(row));
  }

  static async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) return null;

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'faceDescriptor') {
          updateFields.push('face_descriptor = ?');
          updateValues.push(value ? JSON.stringify(value) : null);
        } else if (key === 'employeeId') {
          updateFields.push('employee_id = ?');
          updateValues.push(value);
        } else if (key === 'imageUrl') {
          updateFields.push('image_url = ?');
          updateValues.push(value);
        } else if (key === 'isActive') {
          updateFields.push('is_active = ?');
          updateValues.push(value ? 1 : 0);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    });

    if (updateFields.length === 0) return existingUser;

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await dbRun(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return this.findById(id) as Promise<User>;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);
    return (result as any).changes > 0;
  }

  static async getAllWithFaceDescriptors(): Promise<User[]> {
    const rows = await dbAll('SELECT * FROM users WHERE face_descriptor IS NOT NULL AND is_active = 1');
    return rows.map(row => this.mapRowToUser(row));
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      employeeId: row.employee_id,
      department: row.department,
      faceDescriptor: row.face_descriptor ? JSON.parse(row.face_descriptor) : undefined,
      imageUrl: row.image_url,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
