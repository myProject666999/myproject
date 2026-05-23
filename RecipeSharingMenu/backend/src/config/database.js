const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'recipe_sharing',
  dialect: 'mysql',
  timezone: '+08:00',
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
