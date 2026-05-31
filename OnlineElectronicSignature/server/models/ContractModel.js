const pool = require('../config/db');

const ContractModel = {
    async findAll(filters = {}) {
        let sql = 'SELECT * FROM contracts WHERE 1=1';
        const params = [];
        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.initiator_id) {
            sql += ' AND initiator_id = ?';
            params.push(filters.initiator_id);
        }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM contracts WHERE id = ?', [id]);
        return rows[0];
    },

    async create(contract) {
        const [result] = await pool.query(
            'INSERT INTO contracts (title, description, file_url, file_name, file_hash, status, initiator_id, current_sign_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [contract.title, contract.description, contract.file_url, contract.file_name, contract.file_hash, 'draft', contract.initiator_id, 1]
        );
        return result.insertId;
    },

    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await pool.query(`UPDATE contracts SET ${setClause} WHERE id = ?`, [...values, id]);
    },

    async findPendingByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT c.* FROM contracts c
             INNER JOIN signers s ON s.contract_id = c.id
             WHERE s.user_id = ? AND s.status = 'pending'
             AND c.current_sign_order = s.sign_order
             AND c.status = 'pending_signing'
             ORDER BY c.created_at DESC`,
            [userId]
        );
        return rows;
    },

    async findSignedByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT c.* FROM contracts c
             INNER JOIN signers s ON s.contract_id = c.id
             WHERE s.user_id = ? AND s.status = 'signed'
             ORDER BY c.created_at DESC`,
            [userId]
        );
        return rows;
    }
};

module.exports = ContractModel;
