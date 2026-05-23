const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function splitStatements(sql) {
  const cleaned = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  let cur = "";
  let inStr = false;
  let quote = "";
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inStr) {
      cur += ch;
      if (ch === quote && cleaned[i - 1] !== "\\") inStr = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inStr = true;
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

async function main() {
  const scriptPath = process.argv[2] || path.join(__dirname, "..", "migrations", "0001_init.sql");
  const sql = fs.readFileSync(scriptPath, "utf-8");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    multipleStatements: true,
  });
  const stmts = splitStatements(sql);
  for (const stmt of stmts) {
    try {
      await conn.query(stmt);
      console.log("OK:", stmt.split("\n")[0].slice(0, 80));
    } catch (e) {
      console.log("SKIP:", stmt.split("\n")[0].slice(0, 80), "->", e.message);
    }
  }
  await conn.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
