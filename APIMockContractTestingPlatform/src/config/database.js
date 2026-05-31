const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'api_mock_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+08:00'
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, values);
  return result.insertId;
}

async function update(table, data, where, whereParams = []) {
  const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), ...whereParams];
  const sql = `UPDATE ${table} SET ${setClauses} WHERE ${where}`;
  const [result] = await pool.execute(sql, values);
  return result.affectedRows;
}

async function remove(table, where, whereParams = []) {
  const sql = `DELETE FROM ${table} WHERE ${where}`;
  const [result] = await pool.execute(sql, whereParams);
  return result.affectedRows;
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL数据库连接失败:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  getOne,
  insert,
  update,
  remove,
  testConnection
};
