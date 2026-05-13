const { Op } = require('sequelize');
const { Delivery, Appointment, Customer, Package } = require('../models');

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '', type = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const { count, rows } = await Delivery.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Appointment,
          as: 'appointment',
          include: [
            {
              model: Customer,
              as: 'customer'
            },
            {
              model: Package,
              as: 'package'
            }
          ]
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
    console.error('List deliveries error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Appointment,
          as: 'appointment',
          include: [
            {
              model: Customer,
              as: 'customer'
            },
            {
              model: Package,
              as: 'package'
            }
          ]
        }
      ]
    });

    if (!delivery) {
      return res.status(404).json({ message: '交付记录不存在' });
    }

    res.json(delivery);
  } catch (error) {
    console.error('Get delivery detail error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const { appointmentId, type, cloudAlbumUrl, cloudAlbumPassword, usbSerial, usbCapacity, photoCount, receiverName, receiverPhone, address, trackingNo, logistics, remark } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(400).json({ message: '订单不存在' });
    }

    const delivery = await Delivery.create({
      appointmentId,
      type,
      cloudAlbumUrl,
      cloudAlbumPassword,
      usbSerial,
      usbCapacity,
      photoCount,
      receiverName,
      receiverPhone,
      address,
      trackingNo,
      logistics,
      remark,
      createdBy: req.user.id
    });

    res.status(201).json(delivery);
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);
    
    if (!delivery) {
      return res.status(404).json({ message: '交付记录不存在' });
    }

    Object.assign(delivery, req.body);
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const delivery = await Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({ message: '交付记录不存在' });
    }

    delivery.status = status;
    if (status === 'delivering') {
      delivery.deliverDate = new Date();
    } else if (status === 'received') {
      delivery.receivedDate = new Date();
    }
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);
    
    if (!delivery) {
      return res.status(404).json({ message: '交付记录不存在' });
    }

    await delivery.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete delivery error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
