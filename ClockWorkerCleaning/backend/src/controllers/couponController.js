const { Op } = require('sequelize');
const { Coupon, UserCoupon } = require('../models/associations');
const { success, error, pagination } = require('../utils/response');

async function getAvailableCoupons(req, res, next) {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const today = new Date().toISOString().slice(0, 10);

    const { count, rows } = await Coupon.findAndCountAll({
      where: {
        status: 1,
        validStart: { [Op.lte]: today },
        validEnd: { [Op.gte]: today },
      },
      order: [['id', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function claimCoupon(req, res, next) {
  try {
    const { couponId } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findByPk(couponId);
    if (!coupon || coupon.status !== 1) {
      return res.status(404).json(error('优惠券不存在或已下架'));
    }

    const today = new Date().toISOString().slice(0, 10);
    if (today < coupon.validStart || today > coupon.validEnd) {
      return res.status(400).json(error('优惠券不在有效期内'));
    }

    const userCount = await UserCoupon.count({
      where: { userId, couponId },
    });
    if (userCount >= coupon.perUserLimit) {
      return res.status(400).json(error('已达到领取上限'));
    }

    if (coupon.stock > 0 && coupon.claimed >= coupon.stock) {
      return res.status(400).json(error('优惠券已领完'));
    }

    const exist = await UserCoupon.findOne({
      where: { userId, couponId, status: 0 },
    });
    if (exist) {
      return res.status(400).json(error('您已领取该优惠券'));
    }

    const userCoupon = await UserCoupon.create({
      userId,
      couponId,
      status: 0,
      validStart: coupon.validStart,
      validEnd: coupon.validEnd,
    });

    coupon.claimed = coupon.claimed + 1;
    await coupon.save();

    res.json(success(userCoupon, '领取成功'));
  } catch (err) {
    next(err);
  }
}

async function getMyCoupons(req, res, next) {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const userId = req.user.id;

    const where = { userId };
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }

    const { count, rows } = await UserCoupon.findAndCountAll({
      where,
      include: [{ model: Coupon, as: 'coupon' }],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize),
    });

    res.json(success(pagination(rows, count, page, pageSize)));
  } catch (err) {
    next(err);
  }
}

async function getUsableCoupons(req, res, next) {
  try {
    const { amount } = req.query;
    const userId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    const userCoupons = await UserCoupon.findAll({
      where: {
        userId,
        status: 0,
        validStart: { [Op.lte]: today },
        validEnd: { [Op.gte]: today },
      },
      include: [{ model: Coupon, as: 'coupon' }],
      order: [['createdAt', 'DESC']],
    });

    const usable = userCoupons.filter((uc) => {
      const c = uc.coupon;
      if (amount && Number(amount) < c.minAmount) {
        return false;
      }
      return true;
    });

    res.json(success(usable));
  } catch (err) {
    next(err);
  }
}

async function createCoupon(req, res, next) {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(success(coupon, '创建成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableCoupons,
  claimCoupon,
  getMyCoupons,
  getUsableCoupons,
  createCoupon,
};
