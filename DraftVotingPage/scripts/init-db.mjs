import { readFileSync } from "node:fs";
import { createConnection } from "mysql2/promise";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const cfg = {
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
};

async function main() {
  const sql = readFileSync("sql/schema.sql", "utf8");
  const conn = await createConnection(cfg);
  const statements = sql
    .split(/;\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    if (stmt.startsWith("--")) continue;
    await conn.query(stmt);
  }
  const db = process.env.MYSQL_DATABASE ?? "draft_vote";
  const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM ${db}.contestants`);
  console.log("已初始化数据库，选手数量：", rows[0].c);
  await conn.end();
}

main().catch((err) => {
  console.error("数据库初始化失败：", err.message);
  process.exit(1);
});
