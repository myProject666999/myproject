const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('documents', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  file_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  total_slides: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  is_public: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  allow_download: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  share_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'documents'
});

module.exports = Document;
