require('dotenv').config();
const { initDatabase } = require('./config/init-db');

async function run() {
  try {
    await initDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
