const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShoppingList = sequelize.define('ShoppingList', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  week_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ingredient_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_checked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'shopping_lists'
});

module.exports = ShoppingList;
