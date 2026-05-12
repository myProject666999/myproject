require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: path.resolve(__dirname, '../../data/database.sqlite'),
  logging: false,
});

module.exports = sequelize;
