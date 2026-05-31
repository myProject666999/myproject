const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

const AuthController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: '邮箱和密码不能为空' });
            }
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: '用户不存在' });
            }
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(401).json({ error: '密码错误' });
            }
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );
            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ error: '姓名、邮箱和密码不能为空' });
            }
            const exist = await UserModel.findByEmail(email);
            if (exist) {
                return res.status(400).json({ error: '邮箱已被注册' });
            }
            const hashedPwd = await bcrypt.hash(password, 10);
            const id = await UserModel.create({ name, email, password: hashedPwd, role });
            res.json({ id, message: '注册成功' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getUserList(req, res) {
        try {
            const users = await UserModel.findAll();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = AuthController;
