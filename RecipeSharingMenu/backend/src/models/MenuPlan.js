const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuPlan = sequelize.define('MenuPlan', {
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
  },
  week_day: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '星期几：星期一/星期二/.../星期日'
  },
  meal_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '餐次：早餐/午餐/晚餐/加餐'
  },
  week_start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '本周开始日期'
  }
}, {
  tableName: 'menu_plans'
});

module.exports = MenuPlan;
