import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "qrcode_beautification",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function query(sql: string, params?: unknown[]): Promise<[mysql.RowDataPacket[], mysql.FieldPacket[]]> {
  const pool = getPool();
  return pool.execute(sql, params) as Promise<[mysql.RowDataPacket[], mysql.FieldPacket[]]>;
}

export default getPool;
