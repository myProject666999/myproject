const pool = require('../config/database');

class Symptom {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM symptoms ORDER BY category, name');
    return rows;
  }

  static async getByCategory(category) {
    const [rows] = await pool.query('SELECT * FROM symptoms WHERE category = ? ORDER BY name', [category]);
    return rows;
  }

  static async getCategories() {
    const [rows] = await pool.query('SELECT DISTINCT category FROM symptoms ORDER BY category');
    return rows.map(row => row.category);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM symptoms WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query(`SELECT * FROM symptoms WHERE id IN (${placeholders})`, ids);
    return rows;
  }
}

module.exports = Symptom;
