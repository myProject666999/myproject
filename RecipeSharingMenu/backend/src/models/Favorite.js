const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'recipe_id']
    }
  ]
});

module.exports = Favorite;
