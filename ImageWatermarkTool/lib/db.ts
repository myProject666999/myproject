import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'watermark_tool',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export function getPool(): mysql.Pool {
  return mysql.createPool(dbConfig);
}

export async function query(sql: string, params?: any[]): Promise<any> {
  const pool = getPool();
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } finally {
    await pool.end();
  }
}

export async function initDatabase(): Promise<void> {
  const pool = getPool();
  try {
    await pool.execute('CREATE DATABASE IF NOT EXISTS watermark_tool');
    await pool.execute('USE watermark_tool');
  } finally {
    await pool.end();
  }
}
