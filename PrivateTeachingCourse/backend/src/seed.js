require('dotenv').config();
const { sequelize } = require('./config/database');
const { setupAssociations } = require('./models/associations');
const { seedDatabase } = require('./config/seed');

setupAssociations();

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');
    
    await seedDatabase();
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
