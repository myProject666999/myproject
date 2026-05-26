const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功！');

    const sqlPath = path.join(__dirname, '..', 'database', 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('正在执行数据库初始化脚本...');
    await connection.query(sqlContent);
    console.log('数据库初始化成功！');

    console.log('正在验证数据...');
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM equipment_asset_management.assets');
    console.log(`资产表数据条数: ${rows[0].count}`);

    await connection.end();
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('请确保MySQL服务已启动！');
    }
    process.exit(1);
  }
}

initDatabase();
