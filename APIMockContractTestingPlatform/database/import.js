const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  console.log('开始导入数据库...');

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('禁用外键检查...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log('执行SQL脚本...');
    await connection.query(sql);

    console.log('启用外键检查...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ 数据库导入成功！');
    console.log('数据库名: api_mock_platform');
    console.log('默认用户: admin / admin123');

  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importDatabase();
