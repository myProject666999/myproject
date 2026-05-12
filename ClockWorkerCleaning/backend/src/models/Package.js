const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('daily', 'deep', '开荒'),
    allowNull: false,
    comment: 'daily-日常保洁, deep-深度保洁, 开荒-开荒保洁',
  },
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_hour',
  },
  minHours: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    field: 'min_hours',
    comment: '最少服务小时数',
  },
  maxHours: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
    field: 'max_hours',
    comment: '最多服务小时数',
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  includes: {
    type: DataTypes.TEXT,
    defaultValue: '',
    comment: '服务内容，JSON 字符串',
  },
  coverImage: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'cover_image',
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1-上架，0-下架',
  },
}, {
  tableName: 'packages',
  timestamps: true,
});

module.exports = Package;
