const { Op } = require('sequelize');
const { Package } = require('../models/associations');
const { success, error, pagination } = require('../utils/response');

async function getPackages(req, res, next) {
  try {
    const { type, page = 1, pageSize = 10 } = req.query;
    const where = { status: 1 };

    if (type) {
      where.type = type;
    }

    const { count, rows } = await Package.findAndCountAll({
      where,
      order: [['sort', 'ASC'], ['id', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function getPackageDetail(req, res, next) {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);

    if (!pkg || pkg.status !== 1) {
      return res.status(404).json(error('套餐不存在'));
    }

    res.json(success(pkg));
  } catch (err) {
    next(err);
  }
}

async function createPackage(req, res, next) {
  try {
    const pkg = await Package.create(req.body);
    res.json(success(pkg, '创建成功'));
  } catch (err) {
    next(err);
  }
}

async function updatePackage(req, res, next) {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json(error('套餐不存在'));
    }
    await pkg.update(req.body);
    res.json(success(pkg, '更新成功'));
  } catch (err) {
    next(err);
  }
}

async function deletePackage(req, res, next) {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json(error('套餐不存在'));
    }
    pkg.status = 0;
    await pkg.save();
    res.json(success(null, '下架成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPackages,
  getPackageDetail,
  createPackage,
  updatePackage,
  deletePackage,
};
