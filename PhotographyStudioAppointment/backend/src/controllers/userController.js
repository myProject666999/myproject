const { Op } = require('sequelize');
const { User } = require('../models');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', role = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
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
    console.error('List users error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const { role } = req.query;
    const where = { status: 'active' };
    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'role', 'phone'],
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, password, name, phone, email, role, status } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const user = await User.create({
      username,
      password,
      name,
      phone,
      email,
      role,
      status
    });

    const { password: _, ...userInfo } = user.toJSON();
    res.status(201).json(userInfo);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...updateData } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (password) {
      user.password = password;
    }
    Object.assign(user, updateData);
    await user.save();

    const { password: _, ...userInfo } = user.toJSON();
    res.json(userInfo);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: '不能删除当前登录用户' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
