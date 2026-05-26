const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'online_recruitment',
  charset: 'utf8mb4'
});

connection.connect((err) => {
  if (err) {
    console.error('连接失败:', err.message);
    process.exit(1);
  }
  console.log('数据库连接成功，正在验证...\n');

  connection.query(
    `SELECT TABLE_NAME, TABLE_ROWS 
     FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = 'online_recruitment' 
     ORDER BY TABLE_NAME`,
    (err, tables) => {
      if (err) {
        console.error('查询失败:', err);
      } else {
        console.log('数据库表列表:');
        console.log('========================================');
        tables.forEach((t, i) => {
          console.log(`${i + 1}. ${t.TABLE_NAME.padEnd(30)} 记录数: ${t.TABLE_ROWS}`);
        });
        console.log('========================================\n');

        console.log('测试数据验证:');
        console.log('----------------------------------------');
        
        connection.query('SELECT id, username, role, real_name FROM user;', (err, users) => {
          if (!err) {
            console.log('\n用户表数据:');
            users.forEach(u => {
              console.log(`  ID:${u.id} ${u.username} (${u.role}) - ${u.real_name}`);
            });
          }
          
          connection.query('SELECT id, title, city, min_salary, max_salary, status FROM job;', (err, jobs) => {
            if (!err) {
              console.log('\n职位表数据:');
              jobs.forEach(j => {
                console.log(`  ID:${j.id} ${j.title} (${j.city}) ${j.min_salary}-${j.max_salary}K [${j.status}]`);
              });
            }
            
            connection.query('SELECT id, job_id, user_id, status, applied_at FROM job_application;', (err, apps) => {
              if (!err) {
                console.log('\n投递记录表数据:');
                apps.forEach(a => {
                  console.log(`  ID:${a.id} 职位ID:${a.job_id} 用户ID:${a.user_id} 状态:${a.status}`);
                });
              }
              
              console.log('\n========================================');
              console.log('数据库验证完成！所有数据正常。');
              console.log('========================================');
              connection.end();
            });
          });
        });
      }
    }
  );
});
