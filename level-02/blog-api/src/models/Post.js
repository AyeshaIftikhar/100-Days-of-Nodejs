const pool = require('../config/db');

class Post {
  static async create({ title, content, userId }) {
    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
      [title, content, userId]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT p.*, u.username 
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`
      SELECT p.*, u.username 
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async update(id, { title, content }) {
    await pool.execute(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
  }

  static async findByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }
}

module.exports = Post;