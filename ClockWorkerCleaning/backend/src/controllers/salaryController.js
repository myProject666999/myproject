const sequelize = require('../config/database');
const { Op, fn, col, literal } = require('sequelize');
const { Worker, WorkHour, Salary, Booking } = require('../models/associations');
const { success, error, pagination } = require('../utils/response');
const { generateSettleNo } = require('../utils/orderNo');

async function getWorkerWorkHours(req, res, next) {
  try {
    const { page = 1, pageSize = 10, month, status } = req.query;
    const userId = req.user.id;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(403).json(error('非阿姨账号'));
    }

    const where = { workerId: worker.id };
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }
    if (month) {
      where.workDate = { [Op.like]: `${month}%` };
    }

    const { count, rows } = await WorkHour.findAndCountAll({
      where,
      include: [
        { model: Booking, as: 'booking' },
      ],
      order: [['workDate', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function recordWorkHour(req, res, next) {
  try {
    const { bookingId, actualHours, overtimeHours } = req.body;
    const userId = req.user.id;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(403).json(error('非阿姨账号'));
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, workerId: worker.id, status: 2 },
    });
    if (!booking) {
      return res.status(400).json(error('预约无效或未在服务中'));
    }

    const exist = await WorkHour.findOne({ where: { bookingId } });
    if (exist) {
      return res.status(400).json(error('工时已记录'));
    }

    const planHours = booking.hours;
    const actual = actualHours || planHours;
    const overtime = overtimeHours || 0;
    const hourlyRate = worker.hourlyRate;
    const amount = Number(((actual + overtime * 1.5) * hourlyRate).toFixed(2));

    const workHour = await WorkHour.create({
      workerId: worker.id,
      bookingId,
      workDate: booking.serviceDate,
      planHours,
      actualHours: actual,
      overtimeHours: overtime,
      hourlyRate,
      amount,
      status: 0,
    });

    res.json(success(workHour, '工时记录成功'));
  } catch (err) {
    next(err);
  }
}

async function getWorkerSalaries(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user.id;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(403).json(error('非阿姨账号'));
    }

    const where = { workerId: worker.id };
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }

    const { count, rows } = await Salary.findAndCountAll({
      where,
      order: [['settlePeriod', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function settleSalary(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { workerId, settlePeriod } = req.body;

    const worker = await Worker.findByPk(workerId, { transaction: t });
    if (!worker) {
      await t.rollback();
      return res.status(404).json(error('阿姨不存在'));
    }

    const existSalary = await Salary.findOne({
      where: { workerId, settlePeriod },
      transaction: t,
    });
    if (existSalary) {
      await t.rollback();
      return res.status(400).json(error('该周期已结算'));
    }

    const workHours = await WorkHour.findAll({
      where: {
        workerId,
        workDate: { [Op.like]: `${settlePeriod}%` },
        status: 0,
      },
      transaction: t,
    });

    if (workHours.length === 0) {
      await t.rollback();
      return res.status(400).json(error('该周期无待结算工时'));
    }

    let normalHours = 0;
    let overtimeHours = 0;
    let totalAmount = 0;

    workHours.forEach((wh) => {
      normalHours += Number(wh.actualHours);
      overtimeHours += Number(wh.overtimeHours);
      totalAmount += Number(wh.amount);
    });

    const salary = await Salary.create(
      {
        workerId,
        settleNo: generateSettleNo(),
        settlePeriod,
        totalHours: Number((normalHours + overtimeHours).toFixed(2)),
        normalHours: Number(normalHours.toFixed(2)),
        overtimeHours: Number(overtimeHours.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        payAmount: Number(totalAmount.toFixed(2)),
        status: 0,
      },
      { transaction: t }
    );

    await WorkHour.update(
      { status: 1, salaryId: salary.id },
      {
        where: { id: { [Op.in]: workHours.map((wh) => wh.id) } },
        transaction: t,
      }
    );

    await t.commit();
    res.json(success(salary, '薪资结算成功'));
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function confirmSalary(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(403).json(error('非阿姨账号'));
    }

    const salary = await Salary.findOne({
      where: { id, workerId: worker.id, status: 1 },
    });
    if (!salary) {
      return res.status(404).json(error('薪资记录不存在或不可确认'));
    }

    salary.status = 2;
    await salary.save();

    res.json(success(salary, '薪资确认成功'));
  } catch (err) {
    next(err);
  }
}

async function getSalaryStatistics(req, res, next) {
  try {
    const userId = req.user.id;

    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(403).json(error('非阿姨账号'));
    }

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const [totalResult] = await WorkHour.findAll({
      attributes: [
        [fn('SUM', col('actualHours')), 'totalHours'],
        [fn('SUM', col('overtimeHours')), 'overtimeHours'],
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      where: { workerId: worker.id },
      raw: true,
    });

    const [thisMonthResult] = await WorkHour.findAll({
      attributes: [
        [fn('SUM', col('actualHours')), 'hours'],
        [fn('SUM', col('amount')), 'amount'],
      ],
      where: { workerId: worker.id, workDate: { [Op.like]: `${thisMonth}%` } },
      raw: true,
    });

    const [lastMonthResult] = await WorkHour.findAll({
      attributes: [
        [fn('SUM', col('actualHours')), 'hours'],
        [fn('SUM', col('amount')), 'amount'],
      ],
      where: { workerId: worker.id, workDate: { [Op.like]: `${lastMonth}%` } },
      raw: true,
    });

    const pending = await WorkHour.count({
      where: { workerId: worker.id, status: 0 },
    });

    res.json(success({
      total: {
        hours: Number(totalResult?.totalHours || 0).toFixed(2),
        overtimeHours: Number(totalResult?.overtimeHours || 0).toFixed(2),
        amount: Number(totalResult?.totalAmount || 0).toFixed(2),
      },
      thisMonth: {
        month: thisMonth,
        hours: Number(thisMonthResult?.hours || 0).toFixed(2),
        amount: Number(thisMonthResult?.amount || 0).toFixed(2),
      },
      lastMonth: {
        month: lastMonth,
        hours: Number(lastMonthResult?.hours || 0).toFixed(2),
        amount: Number(lastMonthResult?.amount || 0).toFixed(2),
      },
      pendingSettle: pending,
    }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWorkerWorkHours,
  recordWorkHour,
  getWorkerSalaries,
  settleSalary,
  confirmSalary,
  getSalaryStatistics,
};
