const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('wedding', 'art', 'children', 'other'),
    defaultValue: 'other',
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  photoCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '精修照片数量'
  },
  originalPhotoCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '原片数量'
  },
  includes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '套餐包含内容(JSON格式)'
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'packages',
  timestamps: true,
  hooks: {
    beforeCreate: async (pkg) => {
      if (!pkg.id) {
        const [result] = await sequelize.query('SELECT COALESCE(MAX(id), 0) as maxId FROM packages', { type: sequelize.QueryTypes.SELECT });
        pkg.id = (result.maxId || 0) + 1;
      }
    }
  }
});

module.exports = Package;
