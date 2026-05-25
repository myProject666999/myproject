const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('comments', {
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
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  tableName: 'comments',
  timestamps: true,
  updatedAt: false
});

module.exports = Comment;
