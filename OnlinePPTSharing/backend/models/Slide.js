const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Slide = sequelize.define('slides', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  document_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  page_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'slides',
  timestamps: true,
  updatedAt: false
});

module.exports = Slide;
