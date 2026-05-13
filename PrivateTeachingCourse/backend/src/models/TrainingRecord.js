const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TrainingRecord = sequelize.define('TrainingRecord', {
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
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  trainingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'duration'
  },
  calories: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'training_records'
});

module.exports = TrainingRecord;
