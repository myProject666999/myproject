const pool = require('../config/database');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const [rows] = await pool.execute('SELECT id, username, email, avatar, created_at, updated_at FROM users ORDER BY created_at DESC');
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('获取用户列表失败:', error);
            res.status(500).json({ success: false, message: '获取用户列表失败', error: error.message });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute('SELECT id, username, email, avatar, created_at, updated_at FROM users WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '用户不存在' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('获取用户详情失败:', error);
            res.status(500).json({ success: false, message: '获取用户详情失败', error: error.message });
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, email, password, avatar } = req.body;
            const [result] = await pool.execute(
                'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
                [username, email || null, password || '123456', avatar || null]
            );
            res.json({ success: true, message: '用户创建成功', data: { id: result.insertId } });
        } catch (error) {
            console.error('创建用户失败:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: '用户名已存在' });
            }
            res.status(500).json({ success: false, message: '创建用户失败', error: error.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { email, avatar } = req.body;
            await pool.execute(
                'UPDATE users SET email = ?, avatar = ? WHERE id = ?',
                [email || null, avatar || null, id]
            );
            res.json({ success: true, message: '用户更新成功' });
        } catch (error) {
            console.error('更新用户失败:', error);
            res.status(500).json({ success: false, message: '更新用户失败', error: error.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            await pool.execute('DELETE FROM users WHERE id = ?', [id]);
            res.json({ success: true, message: '用户删除成功' });
        } catch (error) {
            console.error('删除用户失败:', error);
            res.status(500).json({ success: false, message: '删除用户失败', error: error.message });
        }
    }
};

module.exports = userController;
