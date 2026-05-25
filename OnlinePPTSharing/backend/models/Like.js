const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('likes', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  document_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'likes',
  timestamps: true,
  updatedAt: false
});

module.exports = Like;
