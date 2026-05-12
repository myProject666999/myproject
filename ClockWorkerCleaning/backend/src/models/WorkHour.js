const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkHour = sequelize.define('WorkHour', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'worker_id',
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'booking_id',
  },
  workDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'work_date',
  },
  planHours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'plan_hours',
    comment: '计划工时',
  },
  actualHours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'actual_hours',
    comment: '实际工时',
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'overtime_hours',
    comment: '加班工时',
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'hourly_rate',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '工时金额',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-待结算，1-已结算',
  },
  salaryId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'salary_id',
  },
}, {
  tableName: 'work_hours',
  timestamps: true,
});

module.exports = WorkHour;
