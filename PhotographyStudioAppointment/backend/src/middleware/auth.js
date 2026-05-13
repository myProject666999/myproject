const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未授权访问' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: '用户不存在或已禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token 无效或已过期' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
