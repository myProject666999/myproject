const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
  console.log('正在连接数据库...');
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true
  });

  console.log('设置 SQL 模式...');
  await connection.query("SET SESSION sql_mode = ''");
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");

  console.log('删除旧数据库(如果存在)...');
  await connection.query('DROP DATABASE IF EXISTS `online_note_collaboration`');

  console.log('读取 SQL 脚本...');
  const sqlFilePath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

  console.log('执行 SQL 脚本...');
  await connection.query(sqlContent);

  console.log('数据库初始化完成！');

  const [rows] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'online_note_collaboration'"
  );

  console.log('\n已创建的表:');
  rows.forEach(row => console.log('  - ' + (row.TABLE_NAME || row.table_name)));

  const [users] = await connection.query('SELECT * FROM online_note_collaboration.users');
  console.log('\n已创建的用户:');
  users.forEach(u => console.log('  - ' + u.username + ' (' + u.email + ')'));

  await connection.end();
  console.log('\n数据库初始化成功！');
}

initDatabase().catch(err => {
  console.error('数据库初始化失败:', err.message);
  process.exit(1);
});
