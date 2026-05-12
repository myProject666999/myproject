const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('fixed', 'percent'),
    defaultValue: 'fixed',
    comment: 'fixed-固定金额，percent-折扣',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_value',
  },
  minAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'min_amount',
  },
  validStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'valid_start',
  },
  validEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'valid_end',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '发放总量，0 表示无限',
  },
  claimed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '已领取数量',
  },
  perUserLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'per_user_limit',
    comment: '每人限领数量',
  },
  description: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1-可用，0-已下架',
  },
}, {
  tableName: 'coupons',
  timestamps: true,
});

module.exports = Coupon;
