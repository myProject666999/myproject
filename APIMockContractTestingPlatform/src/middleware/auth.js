const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../config/database');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('未提供认证令牌', 401));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return next(new AppError('无效的认证令牌', 403));
    }

    try {
      const dbUser = await db.getOne('SELECT id, username, email, avatar, status FROM users WHERE id = ?', [user.id]);
      if (!dbUser || dbUser.status !== 1) {
        return next(new AppError('用户不存在或已被禁用', 403));
      }
      req.user = dbUser;
      next();
    } catch (error) {
      next(new AppError('认证失败', 500));
    }
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (!err) {
      try {
        const dbUser = await db.getOne('SELECT id, username, email, avatar, status FROM users WHERE id = ?', [user.id]);
        if (dbUser && dbUser.status === 1) {
          req.user = dbUser;
        }
      } catch (error) {
      }
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  optionalAuth
};
