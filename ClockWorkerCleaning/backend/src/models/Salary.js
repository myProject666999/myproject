const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salary = sequelize.define('Salary', {
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
  settleNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    field: 'settle_no',
  },
  settlePeriod: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'settle_period',
    comment: '结算周期，如 2026-05',
  },
  totalHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_hours',
  },
  normalHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'normal_hours',
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'overtime_hours',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_amount',
  },
  bonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  deduction: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  payAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'pay_amount',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-待发放，1-已发放，2-已确认',
  },
  remark: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  paidAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: 'paid_at',
  },
}, {
  tableName: 'salaries',
  timestamps: true,
});

module.exports = Salary;
