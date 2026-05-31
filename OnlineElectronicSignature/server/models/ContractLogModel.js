const pool = require('../config/db');

const ContractLogModel = {
    async findByContractId(contractId) {
        const [rows] = await pool.query(
            `SELECT cl.*, u.name as user_name
             FROM contract_logs cl
             LEFT JOIN users u ON cl.user_id = u.id
             WHERE cl.contract_id = ? ORDER BY cl.action_time DESC`,
            [contractId]
        );
        return rows;
    },

    async getLastHash(contractId) {
        const [rows] = await pool.query(
            'SELECT hash_chain FROM contract_logs WHERE contract_id = ? ORDER BY id DESC LIMIT 1',
            [contractId]
        );
        return rows.length > 0 ? rows[0].hash_chain : null;
    },

    async create(log) {
        const [result] = await pool.query(
            'INSERT INTO contract_logs (contract_id, user_id, action, detail, hash_chain) VALUES (?, ?, ?, ?, ?)',
            [log.contract_id, log.user_id, log.action, log.detail, log.hash_chain]
        );
        return result.insertId;
    }
};

module.exports = ContractLogModel;
