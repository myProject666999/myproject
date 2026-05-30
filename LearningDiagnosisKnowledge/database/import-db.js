const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  console.log('开始连接 MySQL 数据库...');
  
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true
  });

  console.log('数据库连接成功!');

  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('开始执行 SQL 脚本...');
    await connection.query(sqlContent);
    console.log('✅ 数据库脚本导入成功!');
    
    const [rows] = await connection.query('SHOW TABLES FROM learning_diagnosis');
    console.log(`\n📊 已创建 ${rows.length} 张表:`);
    rows.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });

    const [counts] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM learning_diagnosis.users) as users,
        (SELECT COUNT(*) FROM learning_diagnosis.subjects) as subjects,
        (SELECT COUNT(*) FROM learning_diagnosis.knowledge_points) as kps,
        (SELECT COUNT(*) FROM learning_diagnosis.questions) as questions,
        (SELECT COUNT(*) FROM learning_diagnosis.classes) as classes
    `);
    
    console.log('\n📈 初始化数据:');
    console.log(`   - 用户: ${counts[0].users} 人`);
    console.log(`   - 学科: ${counts[0].subjects} 个`);
    console.log(`   - 知识点: ${counts[0].kps} 个`);
    console.log(`   - 题目: ${counts[0].questions} 道`);
    console.log(`   - 班级: ${counts[0].classes} 个`);

  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('\n✅ 数据库连接已关闭');
  }
}

importDatabase();
