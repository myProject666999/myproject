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
    allowNull: false,
    field: 'date'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  height: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  bmi: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  bodyFat: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  muscleMass: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  water: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  boneMass: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  metabolism: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  waist: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  hip: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  chest: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
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
