const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(error('未登录或 token 无效', 401));
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json(error('登录已过期，请重新登录', 401));
  }

  req.user = decoded;
  next();
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(error('未登录', 401));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(error('权限不足', 403));
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  roleMiddleware,
};
