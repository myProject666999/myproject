import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })
  const sqlPath = path.join(__dirname, '..', 'migrations', 'init.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  console.log('Executing init.sql ...')
  await conn.query(sql)
  console.log('Done. Database initialized.')
  await conn.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
