import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

function loadEnv(file) {
  const p = path.resolve(file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

async function main() {
  const host = process.env.MYSQL_HOST ?? "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER ?? "root";
  const password = process.env.MYSQL_PASSWORD ?? "";

  const sqlFile = path.resolve("migrations/001_init.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");

  const conn = await mysql.createConnection({ host, port, user, password });
  try {
    const statements = sql
      .split(/;\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      if (!stmt) continue;
      await conn.query(stmt);
    }
    console.log("✅ Migration applied successfully.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
