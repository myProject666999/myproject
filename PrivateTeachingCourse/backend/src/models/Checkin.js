const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Checkin = sequelize.define('Checkin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  qrCode: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  qrExpireAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkinTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('generated', 'scanned', 'used', 'expired'),
    defaultValue: 'generated'
  }
}, {
  timestamps: true,
  tableName: 'checkins'
});

module.exports = Checkin;
