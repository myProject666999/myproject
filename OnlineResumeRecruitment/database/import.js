const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  multipleStatements: true,
  charset: 'utf8mb4'
});

console.log('正在连接MySQL数据库...');

connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('数据库连接成功！');

  const sqlPath = path.join(__dirname, 'schema.sql');
  console.log('正在读取SQL脚本:', sqlPath);

  let sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('正在执行SQL脚本，这可能需要一些时间...');

  connection.query(sqlContent, (err, results) => {
    if (err) {
      console.error('SQL执行失败:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log('SQL脚本执行成功！');
    
    connection.query('USE online_recruitment; SHOW TABLES;', (err, tables) => {
      if (err) {
        console.error('查询表失败:', err.message);
      } else {
        console.log('\n数据库中已创建的表:');
        tables.forEach((row, index) => {
          const tableName = Object.values(row)[0];
          console.log(`  ${index + 1}. ${tableName}`);
        });

        connection.query('SELECT COUNT(*) as count FROM user;', (err, result) => {
          if (!err) {
            console.log(`\n测试用户数据: ${result[0].count} 条`);
          }
          connection.query('SELECT COUNT(*) as count FROM job;', (err, result) => {
            if (!err) {
              console.log(`测试职位数据: ${result[0].count} 条`);
            }
            connection.query('SELECT COUNT(*) as count FROM job_application;', (err, result) => {
              if (!err) {
                console.log(`测试投递数据: ${result[0].count} 条`);
              }
              console.log('\n========================================');
              console.log('数据库导入完成！');
              console.log('数据库名: online_recruitment');
              console.log('连接地址: 127.0.0.1:3306');
              console.log('用户名: root');
              console.log('========================================');
              connection.end();
            });
          });
        });
      }
    });
  });
});
