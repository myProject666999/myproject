const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  originalPath: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '原片路径'
  },
  thumbnailPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '缩略图路径'
  },
  retouchedPath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '精修后路径'
  },
  type: {
    type: DataTypes.ENUM('original', 'selected', 'retouched', 'final'),
    defaultValue: 'original',
    allowNull: false,
    comment: 'original:原片, selected:已选, retouched:精修中, final:最终成片'
  },
  isSelected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否被客户选中精修'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '客户备注/修图要求'
  }
}, {
  tableName: 'photos',
  timestamps: true,
  hooks: {
    beforeCreate: async (photo) => {
      if (!photo.id) {
        const [result] = await sequelize.query('SELECT COALESCE(MAX(id), 0) as maxId FROM photos', { type: sequelize.QueryTypes.SELECT });
        photo.id = (result.maxId || 0) + 1;
      }
    }
  }
});

module.exports = Photo;
