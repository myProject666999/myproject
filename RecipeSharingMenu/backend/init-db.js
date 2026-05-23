const mysql = require('mysql2/promise');

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456'
  });

  await connection.execute(
    'CREATE DATABASE IF NOT EXISTS recipe_sharing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  );

  console.log('数据库 recipe_sharing 已创建或已存在');
  await connection.end();
}

createDatabase().catch(console.error);
