const { Op } = require('sequelize');
const { Appointment, Customer, Package, User, Photo, WorkOrder, Schedule } = require('../models');

const generateOrderNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
};

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '', date = '', photographerId = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (photographerId) {
      where.photographerId = photographerId;
    }

    const customerWhere = {};
    if (keyword) {
      customerWhere[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Customer,
          as: 'customer',
          where: customerWhere
        },
        {
          model: Package,
          as: 'package'
        },
        {
          model: User,
          as: 'photographer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'stylist',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      total: count,
      list: rows,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('List appointments error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: Package,
          as: 'package'
        },
        {
          model: User,
          as: 'photographer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'stylist',
          attributes: ['id', 'name']
        },
        {
          model: Photo,
          as: 'photos'
        },
        {
          model: WorkOrder,
          as: 'workOrders'
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment detail error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const { customerId, packageId, shootingDate, shootingTime, selectDate, selectTime, photographerId, stylistId, totalAmount, paidAmount, deposit, costumes, remark } = req.body;

    const pkg = await Package.findByPk(packageId);
    if (!pkg) {
      return res.status(400).json({ message: '套餐不存在' });
    }

    let customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(400).json({ message: '客户不存在' });
    }

    const appointment = await Appointment.create({
      orderNo: generateOrderNo(),
      customerId,
      packageId,
      shootingDate,
      shootingTime,
      selectDate,
      selectTime,
      photographerId,
      stylistId,
      totalAmount: totalAmount || pkg.price,
      paidAmount: paidAmount || 0,
      deposit: deposit || 0,
      costumes: costumes ? JSON.stringify(costumes) : null,
      remark,
      createdBy: req.user.id
    });

    if (photographerId) {
      await Schedule.create({
        userId: photographerId,
        appointmentId: appointment.id,
        date: shootingDate,
        timeSlot: shootingTime,
        type: 'shooting',
        status: 'busy',
        createdBy: req.user.id
      });
    }

    if (stylistId) {
      await Schedule.create({
        userId: stylistId,
        appointmentId: appointment.id,
        date: shootingDate,
        timeSlot: shootingTime,
        type: 'shooting',
        status: 'busy',
        createdBy: req.user.id
      });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: '订单不存在' });
    }

    Object.assign(appointment, req.body);
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: '订单不存在' });
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: '订单不存在' });
    }

    await Schedule.destroy({ where: { appointmentId: id } });
    await appointment.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [totalAppointments, totalAmount, todayAppointments] = await Promise.all([
      Appointment.count(),
      Appointment.sum('totalAmount'),
      Appointment.count({
        where: {
          shootingDate: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      })
    ]);

    const statusCounts = await Appointment.findAll({
      attributes: ['status', [Appointment.sequelize.fn('COUNT', Appointment.sequelize.col('id')), 'count']],
      group: ['status']
    });

    res.json({
      totalAppointments,
      totalAmount: totalAmount || 0,
      todayAppointments,
      statusCounts
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
