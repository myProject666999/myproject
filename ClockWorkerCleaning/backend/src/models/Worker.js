const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
  },
  realName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'real_name',
  },
  idCard: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: true,
    field: 'id_card',
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  age: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  gender: {
    type: DataTypes.STRING(2),
    defaultValue: '女',
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
  },
  skillTags: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    field: 'skill_tags',
    comment: '技能标签，逗号分隔',
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '从业年限',
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 5.0,
    comment: '平均评分',
  },
  orderCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'order_count',
    comment: '完成订单数',
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1-在岗，0-休息，2-已下线',
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 50.00,
    field: 'hourly_rate',
    comment: '每小时工资（平台结算价）',
  },
}, {
  tableName: 'workers',
  timestamps: true,
});

module.exports = Worker;
