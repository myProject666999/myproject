const jwt = require('jsonwebtoken');

const SECRET = 'songlist-sharing-secret-key-2024';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }
  const payload = verify(token);
  if (!payload) {
    return res.status(401).json({ code: 401, message: '登录已过期' });
  }
  req.user = payload;
  next();
}

module.exports = { sign, verify, authRequired };
