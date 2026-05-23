const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeIngredient = sequelize.define('RecipeIngredient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '食材名称'
  },
  amount: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用量'
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: null,
    comment: '单位'
  },
  is_optional: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否可选'
  }
}, {
  tableName: 'recipe_ingredients'
});

module.exports = RecipeIngredient;
