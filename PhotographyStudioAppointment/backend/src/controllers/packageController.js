const { Op } = require('sequelize');
const { Package } = require('../models');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', type = '', status = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Package.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['sort', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      list: rows,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('List packages error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const packages = await Package.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC']]
    });
    res.json(packages);
  } catch (error) {
    console.error('Get all packages error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    
    if (!pkg) {
      return res.status(404).json({ message: '套餐不存在' });
    }

    Object.assign(pkg, req.body);
    await pkg.save();
    res.json(pkg);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    
    if (!pkg) {
      await pkg.destroy();
    }
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
