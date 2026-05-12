const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServicePhoto = sequelize.define('ServicePhoto', {
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
  beforePhotoUrl: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'before_photo_url',
  },
  afterPhotoUrl: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'after_photo_url',
  },
  remark: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
}, {
  tableName: 'service_photos',
  timestamps: true,
});

module.exports = ServicePhoto;
