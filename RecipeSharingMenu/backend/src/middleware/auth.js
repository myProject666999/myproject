const { verifyToken } = require('../config/jwt');

const authMiddleware = async (ctx, next) => {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.state.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    ctx.state.user = null;
    return next();
  }

  ctx.state.user = decoded;
  return next();
};

const requireAuth = async (ctx, next) => {
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = { message: '请先登录' };
    return;
  }
  return next();
};

module.exports = {
  authMiddleware,
  requireAuth
};
