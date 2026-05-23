import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function importDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      multipleStatements: true,
    });

    console.log('Connected to MySQL successfully');

    const sqlPath = path.join(process.cwd(), 'migrations', '001_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sql);
    console.log('Database migration executed successfully');

    await connection.end();
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

importDatabase();
