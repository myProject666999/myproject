const { Op } = require('sequelize');
const { WorkOrder, Appointment, User, Customer, Package } = require('../models');

const generateWorkOrderNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO${year}${month}${day}${random}`;
};

exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '', type = '', assigneeId = '' } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    const appointmentWhere = {};
    if (keyword) {
      appointmentWhere[Op.or] = [
        { '$orderNo$': { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await WorkOrder.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Appointment,
          as: 'appointment',
          where: appointmentWhere,
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
        },
        {
          model: User,
          as: 'assignee',
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
    console.error('List work orders error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id, {
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
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    res.json(workOrder);
  } catch (error) {
    console.error('Get work order detail error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const { appointmentId, type, photoIds, assigneeId, priority, dueDate, requirements, remark } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(400).json({ message: '订单不存在' });
    }

    const workOrder = await WorkOrder.create({
      orderNo: generateWorkOrderNo(),
      appointmentId,
      type,
      photoIds: photoIds ? JSON.stringify(photoIds) : null,
      assigneeId,
      priority,
      dueDate,
      requirements,
      remark,
      createdBy: req.user.id
    });

    res.status(201).json(workOrder);
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id);
    
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    const { photoIds, ...updateData } = req.body;
    if (photoIds) {
      updateData.photoIds = JSON.stringify(photoIds);
    }

    Object.assign(workOrder, updateData);
    await workOrder.save();
    res.json(workOrder);
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const workOrder = await WorkOrder.findByPk(id);
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    workOrder.status = status;
    if (feedback) {
      workOrder.feedback = feedback;
    }
    await workOrder.save();
    res.json(workOrder);
  } catch (error) {
    console.error('Update work order status error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await WorkOrder.findByPk(id);
    
    if (!workOrder) {
      return res.status(404).json({ message: '工单不存在' });
    }

    await workOrder.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
