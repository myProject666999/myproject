const pool = require('../config/database');

class Disease {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM diseases ORDER BY severity DESC, name');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM diseases WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query(`SELECT * FROM diseases WHERE id IN (${placeholders}) ORDER BY severity DESC`, ids);
    return rows;
  }

  static async getBySymptoms(symptomIds) {
    if (!symptomIds || symptomIds.length === 0) return [];
    
    const placeholders = symptomIds.map(() => '?').join(',');
    const [rows] = await pool.query(`
      SELECT 
        d.*,
        SUM(r.weight) as total_weight,
        COUNT(r.symptom_id) as matched_symptoms,
        (SELECT COUNT(*) FROM symptom_disease_rules WHERE disease_id = d.id AND is_required = 1) as required_count,
        SUM(CASE WHEN r.is_required = 1 THEN 1 ELSE 0 END) as matched_required
      FROM diseases d
      INNER JOIN symptom_disease_rules r ON d.id = r.disease_id
      WHERE r.symptom_id IN (${placeholders})
      GROUP BY d.id
      HAVING matched_required >= required_count OR required_count = 0
      ORDER BY total_weight DESC, matched_symptoms DESC
      LIMIT 10
    `, symptomIds);
    
    return rows;
  }
}

module.exports = Disease;
