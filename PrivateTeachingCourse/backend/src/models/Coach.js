const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coach = sequelize.define('Coach', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  specialty: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  introduction: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  achievements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00
  },
  studentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'coaches'
});

module.exports = Coach;
