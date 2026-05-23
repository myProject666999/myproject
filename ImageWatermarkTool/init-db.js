const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const config = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true,
  };

  console.log('正在连接数据库...');
  const connection = await mysql.createConnection(config);

  console.log('读取数据库脚本...');
  const sqlPath = path.join(__dirname, 'database.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('执行数据库脚本...');
  await connection.query(sql);

  console.log('数据库初始化完成！');
  await connection.end();
}

initDatabase().catch((err) => {
  console.error('数据库初始化失败:', err.message);
  process.exit(1);
});
