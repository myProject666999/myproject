const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    multipleStatements: true,
  });

  console.log('📡 Connected to MySQL server');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('📖 Reading schema.sql...');

  try {
    await connection.query(schema);
    console.log('✅ Database schema imported successfully!');
  } catch (error) {
    console.error('❌ Error importing schema:', error.message);
    process.exit(1);
  }

  const [rows] = await connection.query('SELECT COUNT(*) as count FROM wallpaper_station.wallpapers');
  console.log(`📊 Wallpaper count: ${rows[0].count}`);

  const [catRows] = await connection.query('SELECT COUNT(*) as count FROM wallpaper_station.categories');
  console.log(`📂 Category count: ${catRows[0].count}`);

  const [sizeRows] = await connection.query('SELECT COUNT(*) as count FROM wallpaper_station.wallpaper_sizes');
  console.log(`📐 Wallpaper sizes count: ${sizeRows[0].count}`);

  await connection.end();
  console.log('✅ Database import completed successfully!');
}

importDatabase().catch(console.error);
