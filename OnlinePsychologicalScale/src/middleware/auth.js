const jwt = require("jsonwebtoken");
const config = require("../config");
const { UnauthorizedError } = require("./errorHandler");

function authMiddleware(req, res, next) {
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies?.token;

  if (!token) {
    return next(new UnauthorizedError("请先登录"));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("登录已过期，请重新登录"));
    }
    return next(new UnauthorizedError("无效的认证信息"));
  }
}

function optionalAuth(req, res, next) {
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    } catch (e) {
      // ignore
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
