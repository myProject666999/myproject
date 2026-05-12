const { Op, Transaction } = require('sequelize');
const sequelize = require('../config/database');
const { Booking, BookingSlot, Package, Worker, User, UserCoupon } = require('../models/associations');
const { success, error, pagination } = require('../utils/response');
const { generateBookingNo } = require('../utils/orderNo');

async function getWorkerAvailableSlots(req, res, next) {
  try {
    const { workerId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json(error('请指定日期'));
    }

    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      return res.status(404).json(error('阿姨不存在'));
    }

    const slots = await BookingSlot.findAll({
      where: {
        workerId,
        slotDate: date,
        status: 1,
      },
    });

    const bookedHours = slots.map((s) => s.slotHour);
    const workStart = 8;
    const workEnd = 22;
    const allSlots = [];

    for (let h = workStart; h < workEnd; h++) {
      allSlots.push({
        hour: h,
        label: `${h}:00-${h + 1}:00`,
        available: !bookedHours.includes(h),
      });
    }

    res.json(success({ date, slots: allSlots, bookedHours }));
  } catch (err) {
    next(err);
  }
}

async function checkTimeConflict(workerId, serviceDate, startTime, endTime, excludeBookingId = null) {
  const hours = [];
  for (let h = startTime; h < endTime; h++) {
    hours.push(h);
  }

  const where = {
    workerId,
    slotDate: serviceDate,
    slotHour: { [Op.in]: hours },
    status: 1,
  };

  if (excludeBookingId) {
    where.bookingId = { [Op.ne]: excludeBookingId };
  }

  const conflictSlots = await BookingSlot.findAll({ where });
  return conflictSlots.length > 0 ? conflictSlots : null;
}

async function createBooking(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const {
      workerId,
      packageId,
      serviceDate,
      startTime,
      endTime,
      address,
      contactName,
      contactPhone,
      remark,
      userCouponId,
    } = req.body;

    if (startTime >= endTime) {
      await t.rollback();
      return res.status(400).json(error('结束时间必须大于开始时间'));
    }

    const hours = endTime - startTime;
    if (hours < 1) {
      await t.rollback();
      return res.status(400).json(error('服务时长至少1小时'));
    }

    const pkg = await Package.findByPk(packageId, { transaction: t });
    if (!pkg || pkg.status !== 1) {
      await t.rollback();
      return res.status(400).json(error('套餐无效'));
    }

    if (hours < pkg.minHours) {
      await t.rollback();
      return res.status(400).json(error(`该套餐最少服务${pkg.minHours}小时`));
    }
    if (hours > pkg.maxHours) {
      await t.rollback();
      return res.status(400).json(error(`该套餐最多服务${pkg.maxHours}小时`));
    }

    const worker = await Worker.findByPk(workerId, { transaction: t });
    if (!worker || worker.status !== 1) {
      await t.rollback();
      return res.status(400).json(error('阿姨不可用'));
    }

    const conflict = await checkTimeConflict(workerId, serviceDate, startTime, endTime);
    if (conflict) {
      await t.rollback();
      return res.status(400).json(error('该时间段已被预约，请选择其他时间'));
    }

    let discountAmount = 0;
    let couponId = null;
    const packagePrice = Number((pkg.pricePerHour * hours).toFixed(2));

    if (userCouponId) {
      const userCoupon = await UserCoupon.findOne({
        where: { id: userCouponId, userId, status: 0 },
        include: [{ model: require('../models/associations').Coupon, as: 'coupon' }],
        transaction: t,
      });

      if (!userCoupon) {
        await t.rollback();
        return res.status(400).json(error('优惠券无效或已使用'));
      }

      const coupon = userCoupon.coupon;
      const today = new Date().toISOString().slice(0, 10);

      if (today < coupon.validStart || today > coupon.validEnd) {
        await t.rollback();
        return res.status(400).json(error('优惠券不在有效期内'));
      }

      if (packagePrice < coupon.minAmount) {
        await t.rollback();
        return res.status(400).json(error(`订单金额需满${coupon.minAmount}元才能使用该优惠券`));
      }

      if (coupon.type === 'fixed') {
        discountAmount = Number(coupon.discountValue);
      } else {
        discountAmount = Number((packagePrice * (1 - coupon.discountValue / 100)).toFixed(2));
      }

      couponId = coupon.id;
    }

    const totalAmount = Number((packagePrice - discountAmount).toFixed(2));
    if (totalAmount < 0) {
      await t.rollback();
      return res.status(400).json(error('优惠金额不能大于订单金额'));
    }

    const booking = await Booking.create(
      {
        bookingNo: generateBookingNo(),
        userId,
        workerId,
        packageId,
        serviceDate,
        startTime,
        endTime,
        hours,
        address,
        contactName,
        contactPhone,
        remark,
        packagePrice,
        couponId,
        discountAmount,
        totalAmount,
        status: 0,
        payStatus: 0,
      },
      { transaction: t }
    );

    const slotRecords = [];
    for (let h = startTime; h < endTime; h++) {
      slotRecords.push({
        bookingId: booking.id,
        workerId,
        slotDate: serviceDate,
        slotHour: h,
        status: 1,
      });
    }
    await BookingSlot.bulkCreate(slotRecords, { transaction: t });

    if (userCouponId) {
      await UserCoupon.update(
        { status: 1, usedAt: new Date(), usedInBookingId: booking.id },
        { where: { id: userCouponId }, transaction: t }
      );
    }

    await t.commit();
    res.json(success(booking, '预约创建成功'));
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function getBookings(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user.id;
    const where = { userId };

    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        { model: Package, as: 'package' },
        { model: Worker, as: 'worker' },
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function getBookingDetail(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id, userId },
      include: [
        { model: Package, as: 'package' },
        { model: Worker, as: 'worker' },
      ],
    });

    if (!booking) {
      return res.status(404).json(error('预约不存在'));
    }

    res.json(success(booking));
  } catch (err) {
    next(err);
  }
}

async function updateBookingStatus(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, cancelReason, rating, review } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ where: { id, userId }, transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json(error('预约不存在'));
    }

    if (status === 4 && booking.status < 2) {
      booking.status = 4;
      booking.cancelReason = cancelReason || '用户取消';

      await BookingSlot.update(
        { status: 0 },
        { where: { bookingId: booking.id }, transaction: t }
      );

      if (booking.couponId) {
        await UserCoupon.update(
          { status: 0, usedAt: null, usedInBookingId: null },
          { where: { usedInBookingId: booking.id }, transaction: t }
        );
      }
    } else if (status === 3 && booking.status === 2) {
      booking.status = 3;
      booking.serviceEndedAt = new Date();

      if (rating) {
        booking.rating = rating;
      }
      if (review) {
        booking.review = review;
      }
    } else if (status === 1 && booking.status === 0) {
      booking.status = 1;
      booking.payStatus = 1;
    } else if (status === 2 && booking.status === 1) {
      booking.status = 2;
      booking.serviceStartedAt = new Date();
    }

    await booking.save({ transaction: t });
    await t.commit();

    res.json(success(booking, '状态更新成功'));
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function getWorkerBookings(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user.id;

    const Worker = require('../models/associations').Worker;
    const worker = await Worker.findOne({ where: { userId } });
    if (!worker) {
      return res.status(403).json(error('非阿姨账号'));
    }

    const where = { workerId: worker.id };
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        { model: Package, as: 'package' },
        { model: User, as: 'user', attributes: ['id', 'phone', 'nickName'] },
      ],
      order: [['serviceDate', 'DESC'], ['startTime', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWorkerAvailableSlots,
  createBooking,
  getBookings,
  getBookingDetail,
  updateBookingStatus,
  getWorkerBookings,
};
