const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Download = sequelize.define('downloads', {
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
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'downloads',
  timestamps: true,
  updatedAt: false
});

module.exports = Download;
