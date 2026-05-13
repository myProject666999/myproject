const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Costume = sequelize.define('Costume', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('wedding', 'art', 'children', 'other'),
    defaultValue: 'other',
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'unisex', 'child'),
    defaultValue: 'unisex',
    allowNull: false
  },
  size: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'retired'),
    defaultValue: 'available',
    allowNull: false
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'costumes',
  timestamps: true,
  hooks: {
    beforeCreate: async (costume) => {
      if (!costume.id) {
        const [result] = await sequelize.query('SELECT COALESCE(MAX(id), 0) as maxId FROM costumes', { type: sequelize.QueryTypes.SELECT });
        costume.id = (result.maxId || 0) + 1;
      }
    }
  }
});

module.exports = Costume;
