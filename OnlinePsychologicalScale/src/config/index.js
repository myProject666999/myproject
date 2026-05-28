require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "psych_scale_secret_key_2024",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "psych_scale",
    charset: "utf8mb4",
    timezone: "+08:00",
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || "",
    db: parseInt(process.env.REDIS_DB || "0"),
  },
  bcryptSaltRounds: 10,
  saveIntervalMs: 30000,
};
