const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  try {
    console.log('正在连接MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('MySQL连接成功！');

    const sqlPath = path.join(__dirname, '../../database/init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('正在执行数据库初始化脚本...');
    await connection.query(sqlContent);
    console.log('数据库初始化完成！');

    console.log('\n========== 初始化数据统计 ==========');
    const [rows] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM online_consultation.symptoms) as symptom_count,
        (SELECT COUNT(*) FROM online_consultation.diseases) as disease_count,
        (SELECT COUNT(*) FROM online_consultation.decision_questions) as question_count,
        (SELECT COUNT(*) FROM online_consultation.health_articles) as article_count
    `);
    const stats = rows[0];
    console.log(`症状数据: ${stats.symptom_count} 条`);
    console.log(`疾病数据: ${stats.disease_count} 条`);
    console.log(`决策树问题: ${stats.question_count} 条`);
    console.log(`健康文章: ${stats.article_count} 篇`);
    console.log('====================================\n');

  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n请检查MySQL服务是否已启动！');
      console.error('请确认数据库连接配置正确：');
      console.error(`  主机: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.error(`  用户: ${process.env.DB_USER}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
