import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  multipleStatements: true
};

async function initDatabase() {
  let connection: mysql.Connection | null = null;
  try {
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(config);
    
    console.log('Reading SQL file...');
    const sqlPath = path.join(process.cwd(), 'migrations', '001_init_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    await connection.query(sql);
    
    console.log('Database initialized successfully!');
    
    const [rows] = await connection.query('SHOW TABLES FROM investment_portfolio');
    console.log('Tables created:');
    console.log(rows);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
