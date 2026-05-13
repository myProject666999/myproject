const { Op } = require('sequelize');
const { Customer, Appointment } = require('../models');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { wechat: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Appointment,
        as: 'appointments',
        attributes: ['id', 'orderNo', 'status']
      }]
    });

    res.json({
      total: count,
      list: rows,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: '该手机号已存在' });
    }
    console.error('Create customer error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({ message: '客户不存在' });
    }

    Object.assign(customer, req.body);
    await customer.save();
    res.json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: '该手机号已存在' });
    }
    console.error('Update customer error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({ message: '客户不存在' });
    }

    const appointments = await Appointment.count({ where: { customerId: id } });
    if (appointments > 0) {
      return res.status(400).json({ message: '该客户存在订单，无法删除' });
    }

    await customer.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
