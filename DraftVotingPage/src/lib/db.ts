import { createPool } from "mysql2/promise";

const pool = createPool({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "draft_vote",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = pool;

export async function query(sql: string, params: any[] = []) {
  const [rows] = await pool.execute(sql as any, params);
  return rows as any[];
}
