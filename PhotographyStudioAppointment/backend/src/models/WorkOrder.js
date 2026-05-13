const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  photoIds: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '照片ID列表(JSON格式)'
  },
  type: {
    type: DataTypes.ENUM('second_revision', 'retouch', 'design'),
    defaultValue: 'retouch',
    allowNull: false,
    comment: 'second_revision:二修, retouch:精修, design:设计'
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '分配给的修图师/设计师ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'reviewing', 'revised', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'pending:待处理, processing:处理中, reviewing:待审核, revised:已返修, completed:已完成, cancelled:已取消'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '修图要求'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '客户反馈/审核意见'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'work_orders',
  timestamps: true
});

module.exports = WorkOrder;
