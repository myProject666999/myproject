const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nickName: {
    type: DataTypes.STRING(50),
    defaultValue: '用户',
    field: 'nick_name',
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  role: {
    type: DataTypes.ENUM('user', 'worker', 'admin'),
    defaultValue: 'user',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1-正常，0-禁用',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
