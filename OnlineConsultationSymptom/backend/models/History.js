const pool = require('../config/database');

class History {
  static async create(data) {
    const { userId, symptomsSelected, questionAnswers, resultDiseases, adviceGiven, consultationType } = data;
    const [result] = await pool.query(
      `INSERT INTO consultation_history 
       (user_id, symptoms_selected, question_answers, result_diseases, advice_given, consultation_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(symptomsSelected || []),
        JSON.stringify(questionAnswers || []),
        JSON.stringify(resultDiseases || []),
        adviceGiven || '',
        consultationType || 'symptom'
      ]
    );
    return result.insertId;
  }

  static async getByUserId(userId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT * FROM consultation_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM consultation_history WHERE user_id = ?',
      [userId]
    );
    return {
      list: rows.map(row => ({
        ...row,
        symptoms_selected: row.symptoms_selected ? JSON.parse(row.symptoms_selected) : [],
        question_answers: row.question_answers ? JSON.parse(row.question_answers) : [],
        result_diseases: row.result_diseases ? JSON.parse(row.result_diseases) : []
      })),
      total: countResult[0].total,
      page,
      pageSize
    };
  }

  static async getById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM consultation_history WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      symptoms_selected: row.symptoms_selected ? JSON.parse(row.symptoms_selected) : [],
      question_answers: row.question_answers ? JSON.parse(row.question_answers) : [],
      result_diseases: row.result_diseases ? JSON.parse(row.result_diseases) : []
    };
  }

  static async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM consultation_history WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = History;
