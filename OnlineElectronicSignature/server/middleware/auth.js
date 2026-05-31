const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '未提供认证令牌' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: '令牌无效或已过期' });
    }
}

function adminAuth(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
}

module.exports = { auth, adminAuth };
