import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  multipleStatements: true,
};

async function main() {
  try {
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection(dbConfig);

    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);

    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await connection.query(schema);

    console.log('Database schema imported successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error importing database schema:', error);
    process.exit(1);
  }
}

main();
