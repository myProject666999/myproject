const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  console.log('开始连接数据库...');
  
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true
  });

  try {
    console.log('数据库连接成功！');
    
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('开始执行 SQL 脚本...');
    await connection.query(sqlContent);
    
    console.log('✓ 数据库导入成功！');
    console.log('✓ 数据库: ad_management');
    console.log('✓ 包含表: ad_spaces, ad_materials, ad_schedules, ad_stats');
    console.log('✓ 已插入初始测试数据');
    
  } catch (error) {
    console.error('导入失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importDatabase();
