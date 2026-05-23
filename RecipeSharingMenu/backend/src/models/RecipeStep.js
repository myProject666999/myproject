const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeStep = sequelize.define('RecipeStep', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  step_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '步骤排序'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '步骤内容'
  },
  image: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    comment: '步骤图片'
  }
}, {
  tableName: 'recipe_steps'
});

module.exports = RecipeStep;
