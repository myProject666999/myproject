const { Op } = require('sequelize');
const { Schedule, User, Appointment, Customer } = require('../models');

exports.list = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const where = {};
    if (userId) {
      where.userId = userId;
    }
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'role']
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'orderNo']
        }
      ],
      order: [['date', 'ASC'], ['timeSlot', 'ASC']]
    });

    res.json(schedules);
  } catch (error) {
    console.error('List schedules error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const { userId, year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const where = {
      date: {
        [Op.between]: [startDate, endDate]
      }
    };
    if (userId) {
      where.userId = userId;
    }

    const schedules = await Schedule.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'role']
        },
        {
          model: Appointment,
          as: 'appointment',
          include: [
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
              model: Customer,
              as: 'customer',
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ],
      order: [['date', 'ASC'], ['timeSlot', 'ASC']]
    });

    res.json(schedules);
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.create = async (req, res) => {
  try {
    const schedule = await Schedule.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    
    if (!schedule) {
      return res.status(404).json({ message: '档期不存在' });
    }

    Object.assign(schedule, req.body);
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByPk(id);
    
    if (!schedule) {
      return res.status(404).json({ message: '档期不存在' });
    }

    await schedule.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
