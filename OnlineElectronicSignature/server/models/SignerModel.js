const pool = require('../config/db');

const SignerModel = {
    async findByContractId(contractId) {
        const [rows] = await pool.query(
            `SELECT s.*, u.name as user_name, u.email as user_email
             FROM signers s
             INNER JOIN users u ON s.user_id = u.id
             WHERE s.contract_id = ? ORDER BY s.sign_order`,
            [contractId]
        );
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM signers WHERE id = ?', [id]);
        return rows[0];
    },

    async findByContractAndOrder(contractId, signOrder) {
        const [rows] = await pool.query(
            'SELECT * FROM signers WHERE contract_id = ? AND sign_order = ?',
            [contractId, signOrder]
        );
        return rows[0];
    },

    async batchCreate(signers) {
        const values = signers.map(s => [s.contract_id, s.user_id, s.sign_order]);
        const placeholders = signers.map(() => '(?, ?, ?)').join(', ');
        const flatValues = values.flat();
        const [result] = await pool.query(
            `INSERT INTO signers (contract_id, user_id, sign_order) VALUES ${placeholders}`,
            flatValues
        );
        return result.affectedRows;
    },

    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await pool.query(`UPDATE signers SET ${setClause} WHERE id = ?`, [...values, id]);
    },

    async deleteByContractId(contractId) {
        await pool.query('DELETE FROM signers WHERE contract_id = ?', [contractId]);
    }
};

module.exports = SignerModel;
