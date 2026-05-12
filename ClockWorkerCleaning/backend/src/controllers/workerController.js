const { Op } = require('sequelize');
const { Worker, WorkerCertificate } = require('../models/associations');
const { success, error, pagination } = require('../utils/response');

async function getWorkers(req, res, next) {
  try {
    const { page = 1, pageSize = 10, keyword, status, sortBy } = req.query;
    const where = {};

    if (status !== undefined) {
      where.status = status;
    } else {
      where.status = 1;
    }

    if (keyword) {
      where[Op.or] = [
        { realName: { [Op.like]: `%${keyword}%` } },
        { skillTags: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    let order = [['rating', 'DESC'], ['orderCount', 'DESC']];
    if (sortBy === 'rating') {
      order = [['rating', 'DESC']];
    } else if (sortBy === 'orders') {
      order = [['orderCount', 'DESC']];
    }

    const { count, rows } = await Worker.findAndCountAll({
      where,
      order,
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function getWorkerDetail(req, res, next) {
  try {
    const { id } = req.params;
    const worker = await Worker.findByPk(id, {
      include: [
        {
          model: WorkerCertificate,
          as: 'certificates',
          where: { status: 1 },
          required: false,
        },
      ],
    });

    if (!worker) {
      return res.status(404).json(error('阿姨不存在'));
    }

    res.json(success(worker));
  } catch (err) {
    next(err);
  }
}

async function createWorker(req, res, next) {
  try {
    const worker = await Worker.create(req.body);
    res.json(success(worker, '创建成功'));
  } catch (err) {
    next(err);
  }
}

async function updateWorker(req, res, next) {
  try {
    const { id } = req.params;
    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json(error('阿姨不存在'));
    }
    await worker.update(req.body);
    res.json(success(worker, '更新成功'));
  } catch (err) {
    next(err);
  }
}

async function getWorkerCertificates(req, res, next) {
  try {
    const { workerId } = req.params;
    const certs = await WorkerCertificate.findAll({
      where: { workerId },
      order: [['createdAt', 'DESC']],
    });
    res.json(success(certs));
  } catch (err) {
    next(err);
  }
}

async function addWorkerCertificate(req, res, next) {
  try {
    const { workerId } = req.params;
    const cert = await WorkerCertificate.create({
      ...req.body,
      workerId,
    });
    res.json(success(cert, '添加成功'));
  } catch (err) {
    next(err);
  }
}

async function updateWorkerCertificate(req, res, next) {
  try {
    const { id } = req.params;
    const cert = await WorkerCertificate.findByPk(id);
    if (!cert) {
      return res.status(404).json(error('证件不存在'));
    }
    await cert.update(req.body);
    res.json(success(cert, '更新成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWorkers,
  getWorkerDetail,
  createWorker,
  updateWorker,
  getWorkerCertificates,
  addWorkerCertificate,
  updateWorkerCertificate,
};
