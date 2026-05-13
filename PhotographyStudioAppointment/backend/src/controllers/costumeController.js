const { Op } = require('sequelize');
const { Costume } = require('../models');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', category = '', status = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Costume.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      list: rows,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('List costumes error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const costumes = await Costume.findAll({
      where: { status: 'available' },
      order: [['name', 'ASC']]
    });
    res.json(costumes);
  } catch (error) {
    console.error('Get all costumes error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const costume = await Costume.create(req.body);
    res.status(201).json(costume);
  } catch (error) {
    console.error('Create costume error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const costume = await Costume.findByPk(id);
    
    if (!costume) {
      return res.status(404).json({ message: '服装不存在' });
    }

    Object.assign(costume, req.body);
    await costume.save();
    res.json(costume);
  } catch (error) {
    console.error('Update costume error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const costume = await Costume.findByPk(id);
    
    if (!costume) {
      await costume.destroy();
    }
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete costume error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
