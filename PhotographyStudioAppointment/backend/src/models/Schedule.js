const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '摄影师或化妆师ID'
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '时段，如 09:00-12:00'
  },
  type: {
    type: DataTypes.ENUM('shooting', 'selection', 'rest', 'other'),
    defaultValue: 'shooting',
    allowNull: false,
    comment: 'shooting:拍摄, selection:选片, rest:休息, other:其他'
  },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'leave'),
    defaultValue: 'available',
    allowNull: false
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'date']
    }
  ]
});

module.exports = Schedule;
