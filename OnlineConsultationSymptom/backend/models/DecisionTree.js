const pool = require('../config/database');

class DecisionTree {
  static async getRootQuestion() {
    const [rows] = await pool.query('SELECT * FROM decision_questions WHERE parent_id IS NULL LIMIT 1');
    return rows[0];
  }

  static async getQuestionById(id) {
    const [rows] = await pool.query('SELECT * FROM decision_questions WHERE id = ?', [id]);
    return rows[0];
  }

  static async getNextQuestion(parentId, answer) {
    const [rows] = await pool.query(
      'SELECT * FROM decision_questions WHERE parent_id = ? AND parent_answer = ? LIMIT 1',
      [parentId, answer]
    );
    return rows[0];
  }

  static async getAvailableAnswers(parentId) {
    const [rows] = await pool.query(
      'SELECT DISTINCT parent_answer as answer FROM decision_questions WHERE parent_id = ?',
      [parentId]
    );
    return rows.map(row => row.answer);
  }

  static async getResultDiseases(diseaseIds) {
    if (!diseaseIds || diseaseIds.length === 0) return [];
    const placeholders = diseaseIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT * FROM diseases WHERE id IN (${placeholders}) ORDER BY severity DESC`,
      diseaseIds
    );
    return rows;
  }
}

module.exports = DecisionTree;
