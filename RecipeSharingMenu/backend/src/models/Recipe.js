const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类：家常菜/川菜/粤菜/甜品/汤羹/主食/其他'
  },
  flavor: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '口味：清淡/微辣/中辣/麻辣/酸甜/咸鲜'
  },
  difficulty: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '难度：简单/中等/困难'
  },
  cook_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '烹饪时间（分钟）'
  },
  servings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '份量'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favorites_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'recipes'
});

module.exports = Recipe;
