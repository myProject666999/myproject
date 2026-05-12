const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    field: 'booking_no',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  workerId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'worker_id',
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'package_id',
  },
  serviceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'service_date',
  },
  startTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'start_time',
    comment: '开始时间，0-23',
  },
  endTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'end_time',
    comment: '结束时间，1-24',
  },
  hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '服务时长，小时',
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  contactName: {
    type: DataTypes.STRING(50),
    defaultValue: '',
    field: 'contact_name',
  },
  contactPhone: {
    type: DataTypes.STRING(11),
    defaultValue: '',
    field: 'contact_phone',
  },
  remark: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  packagePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'package_price',
  },
  couponId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'coupon_id',
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'discount_amount',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
  },
  actualAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: null,
    field: 'actual_amount',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '0-待支付,1-待服务,2-服务中,3-已完成,4-已取消,5-已退款',
  },
  payStatus: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'pay_status',
    comment: '0-未支付,1-已支付,2-已退款',
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    comment: '用户评分 1-5',
  },
  review: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    comment: '用户评价',
  },
  cancelReason: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'cancel_reason',
  },
  serviceStartedAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: 'service_started_at',
  },
  serviceEndedAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: 'service_ended_at',
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
