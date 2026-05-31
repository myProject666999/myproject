const pool = require('../config/db');

const UserModel = {
    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    async findAll() {
        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
        return rows;
    },

    async create(user) {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [user.name, user.email, user.password, user.role || 'user']
        );
        return result.insertId;
    }
};

module.exports = UserModel;
