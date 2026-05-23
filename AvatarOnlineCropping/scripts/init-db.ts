import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    multipleStatements: true,
  };

  try {
    const connection = await mysql.createConnection(config);
    
    const sqlPath = path.join(process.cwd(), 'migrations', '001_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await connection.query(sql);
    console.log('数据库初始化成功！');
    
    await connection.end();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
