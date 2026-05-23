import mysql from 'mysql2/promise';

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
  });

  try {
    console.log('正在初始化数据库...');

    await connection.query(`
      CREATE DATABASE IF NOT EXISTS json_formatting_tool 
      DEFAULT CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log('数据库创建成功');

    await connection.query('USE json_formatting_tool');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS history (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_history_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('数据表创建成功');

    const [rows]: any = await connection.query(
      'SELECT COUNT(*) as count FROM history'
    );
    if (rows[0].count === 0) {
      await connection.query(
        `INSERT INTO history (id, title, content) VALUES
        ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '示例用户数据', '{"name": "张三", "age": 25, "email": "zhangsan@example.com"}'),
        ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '示例配置数据', '{"app": {"name": "JSONFormatter", "version": "1.0.0"}, "settings": {"theme": "dark", "language": "zh-CN"}}')
        `
      );
      console.log('示例数据插入成功');
    }

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initDatabase().catch(console.error);
