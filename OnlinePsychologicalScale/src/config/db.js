const mysql = require("mysql2/promise");
const config = require("../config");

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  charset: config.db.charset,
  timezone: config.db.timezone,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on("connection", (connection) => {
  console.log("[MySQL] 新连接建立");
});

pool.on("error", (err) => {
  console.error("[MySQL] 连接池错误:", err.message);
});

module.exports = pool;
