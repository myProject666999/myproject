import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function importDatabase() {
  try {
    const dbConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      multipleStatements: true,
    };

    console.log('正在连接MySQL服务器...');
    const connection = await mysql.createConnection(dbConfig);

    console.log('正在创建数据库...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS `online_invitation` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✓ 数据库创建成功');

    await connection.end();

    console.log('正在连接数据库...');
    const pool = await mysql.createPool({
      ...dbConfig,
      database: 'online_invitation',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    let schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    schemaSQL = schemaSQL.replace(/CREATE DATABASE[^;]+;/g, '');
    schemaSQL = schemaSQL.replace(/USE `[^`]+`;/g, '');

    console.log('正在导入表结构和数据...');
    
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query(schemaSQL);
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✓ SQL执行完成');

    const [templates]: any = await pool.execute('SELECT COUNT(*) as count FROM templates');
    const [invitations]: any = await pool.execute('SELECT COUNT(*) as count FROM invitations');
    const [registrations]: any = await pool.execute('SELECT COUNT(*) as count FROM registrations');

    console.log(`\n数据统计:`);
    console.log(`  - 模板数量: ${templates[0].count}`);
    console.log(`  - 邀请函数量: ${invitations[0].count}`);
    console.log(`  - 报名数量: ${registrations[0].count}`);

    await pool.end();
    console.log('\n数据库导入完成！');
  } catch (error: any) {
    console.error('数据库导入失败:', error.message);
    process.exit(1);
  }
}

importDatabase();
