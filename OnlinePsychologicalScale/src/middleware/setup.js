const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

function maskIp(ip) {
  if (!ip) return "";
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return parts.slice(0, 3).join(":") + ":***";
    }
    return ip;
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return parts[0] + "." + parts[1] + ".***.***";
  }
  return ip;
}

function setupMiddleware(app) {
  app.use(helmet({
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    frameguard: { action: "deny" },
    xssFilter: true,
    noSniff: true,
  }));

  app.use(
    cors({
      origin: true,
      credentials: true,
      maxAge: 86400,
    })
  );

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "请求过于频繁，请稍后再试" },
  });
  app.use("/api/", generalLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "登录尝试次数过多，请稍后再试" },
  });
  app.use("/api/users/login", authLimiter);
  app.use("/api/users/register", authLimiter);

  morgan.token("maskedIp", (req) => maskIp(req.clientIp || req.ip));
  app.use(morgan(':maskedIp - :method :url :status :response-time ms - :res[content-length]'));

  const express = require("express");
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use(cookieParser());

  app.use((req, res, next) => {
    if (req.ip) {
      req.clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip ||
        "";
    }
    next();
  });

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Privacy-Policy", "no-tracking");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.removeHeader("X-Powered-By");
    next();
  });
}

module.exports = { setupMiddleware, maskIp };
