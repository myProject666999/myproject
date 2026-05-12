const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingSlot = sequelize.define('BookingSlot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'booking_id',
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'worker_id',
  },
  slotDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'slot_date',
  },
  slotHour: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'slot_hour',
    comment: '0-23',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1-已占用，0-已释放',
  },
}, {
  tableName: 'booking_slots',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['worker_id', 'slot_date', 'slot_hour'],
    },
  ],
});

module.exports = BookingSlot;
