const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单编号'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  photographerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  stylistId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  shootingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '拍摄日期'
  },
  shootingTime: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '拍摄时段'
  },
  selectDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '选片日期'
  },
  selectTime: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '选片时段'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '总金额'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '已付金额'
  },
  deposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '定金'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shooting', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'pending:待确认, confirmed:已确认, shooting:拍摄中, completed:已完成, cancelled:已取消'
  },
  costumes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '服装ID列表(JSON格式)'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

module.exports = Appointment;
