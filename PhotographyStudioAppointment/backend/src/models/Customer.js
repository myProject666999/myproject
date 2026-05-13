const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true
  },
  wechat: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '客户来源'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['phone']
    }
  ],
  hooks: {
    beforeCreate: async (customer) => {
      if (!customer.id) {
        const [result] = await sequelize.query('SELECT COALESCE(MAX(id), 0) as maxId FROM customers', { type: sequelize.QueryTypes.SELECT });
        customer.id = (result.maxId || 0) + 1;
      }
    }
  }
});

module.exports = Customer;
