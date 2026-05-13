const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SuccessStory = sequelize.define('SuccessStory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  coachId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coaches',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  beforePhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'beforeImage'
  },
  afterPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'afterImage'
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  results: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'success_stories'
});

module.exports = SuccessStory;
