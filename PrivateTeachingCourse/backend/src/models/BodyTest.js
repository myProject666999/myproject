const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BodyTest = sequelize.define('BodyTest', {
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
  testDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  bmi: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  bodyFat: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  muscleMass: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  waist: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  hip: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  chest: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'body_tests'
});

module.exports = BodyTest;
