const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCoupon = sequelize.define('UserCoupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  couponId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'coupon_id',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-未使用，1-已使用，2-已过期',
  },
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: 'used_at',
  },
  usedInBookingId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'used_in_booking_id',
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
}, {
  tableName: 'user_coupons',
  timestamps: true,
});

module.exports = UserCoupon;
