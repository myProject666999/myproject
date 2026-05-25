const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Share = sequelize.define('shares', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  document_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  share_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'link'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'shares',
  timestamps: true,
  updatedAt: false
});

module.exports = Share;
