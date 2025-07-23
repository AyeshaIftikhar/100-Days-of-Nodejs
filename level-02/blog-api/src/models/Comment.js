const pool = require('../config/db');

class Comment {
  static async create({ content, postId, userId }) {
    const [result] = await pool.execute(
      'INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)',
      [content, postId, userId]
    );
    return result.insertId;
  }

  static async findByPost(postId) {
    const [rows] = await pool.execute(`
      SELECT c.*, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);
    return rows;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM comments WHERE id = ?', [id]);
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Comment;