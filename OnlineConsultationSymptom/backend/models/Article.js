const pool = require('../config/database');

class Article {
  static async getAll(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      'SELECT id, title, summary, author, category, cover_image, view_count, publish_time FROM health_articles ORDER BY publish_time DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM health_articles');
    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  static async getById(id) {
    await pool.query('UPDATE health_articles SET view_count = view_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT * FROM health_articles WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByCategory(category, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      'SELECT id, title, summary, author, category, cover_image, view_count, publish_time FROM health_articles WHERE category = ? ORDER BY publish_time DESC LIMIT ? OFFSET ?',
      [category, pageSize, offset]
    );
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM health_articles WHERE category = ?', [category]);
    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  static async getCategories() {
    const [rows] = await pool.query('SELECT DISTINCT category FROM health_articles ORDER BY category');
    return rows.map(row => row.category);
  }

  static async getPopular(limit = 5) {
    const [rows] = await pool.query(
      'SELECT id, title, summary, author, category, view_count FROM health_articles ORDER BY view_count DESC LIMIT ?',
      [limit]
    );
    return rows;
  }
}

module.exports = Article;
