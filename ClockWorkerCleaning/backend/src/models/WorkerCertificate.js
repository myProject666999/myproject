const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkerCertificate = sequelize.define('WorkerCertificate', {
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
  certNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'cert_no',
  },
  certType: {
    type: DataTypes.STRING(50),
    defaultValue: '健康证',
    field: 'cert_type',
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'issue_date',
  },
  expireDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expire_date',
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    field: 'image_url',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1-有效，0-过期，2-失效',
  },
}, {
  tableName: 'worker_certificates',
  timestamps: true,
});

module.exports = WorkerCertificate;
