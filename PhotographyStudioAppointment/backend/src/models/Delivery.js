const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('cloud', 'usb', 'both'),
    defaultValue: 'cloud',
    allowNull: false,
    comment: 'cloud:云相册, usb:U盘, both:两者'
  },
  cloudAlbumUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '云相册链接'
  },
  cloudAlbumPassword: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '云相册密码'
  },
  usbSerial: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'U盘序列号'
  },
  usbCapacity: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'U盘容量'
  },
  photoCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '交付照片数量'
  },
  receiverName: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '收件人姓名'
  },
  receiverPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '收件人电话'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '收货地址'
  },
  trackingNo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '快递单号'
  },
  logistics: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '物流公司'
  },
  status: {
    type: DataTypes.ENUM('pending', 'delivering', 'delivered', 'received'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'pending:待交付, delivering:配送中, delivered:已送达, received:已签收'
  },
  deliverDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'deliveries',
  timestamps: true
});

module.exports = Delivery;
