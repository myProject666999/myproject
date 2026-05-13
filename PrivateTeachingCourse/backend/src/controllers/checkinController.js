const crypto = require('crypto');
const Checkin = require('../models/Checkin');
const Booking = require('../models/Booking');
const Course = require('../models/Course');
const Coach = require('../models/Coach');
const User = require('../models/User');

const generateCheckinQR = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      where: { id: bookingId, userId: req.user.id, status: 'confirmed' },
      include: [Course]
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Valid booking not found' });
    }
    
    const courseDate = new Date(booking.Course.date + 'T' + booking.Course.startTime);
    const now = new Date();
    const timeDiff = (courseDate - now) / (1000 * 60);
    
    if (timeDiff > 30 || timeDiff < -60) {
      return res.status(400).json({ error: 'QR code can only be generated 30 minutes before to 1 hour after class starts' });
    }
    
    const existingCheckin = await Checkin.findOne({
      where: { bookingId, status: ['pending', 'checked_in'] }
    });
    
    if (existingCheckin) {
      return res.json({ checkin: existingCheckin });
    }
    
    const qrCode = crypto.randomBytes(16).toString('hex');
    
    const checkin = await Checkin.create({
      courseId: booking.courseId,
      userId: req.user.id,
      bookingId,
      qrCode,
      status: 'pending'
    });
    
    res.json({ checkin });
  } catch (error) {
    console.error('Generate checkin QR error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const scanCheckin = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    const checkin = await Checkin.findOne({
      where: { qrCode, status: 'pending' },
      include: [
        { model: User, attributes: ['id', 'name', 'avatar', 'phone'] },
        { model: Course, include: [{ model: Coach, include: [{ model: User }] }] }
      ]
    });
    
    if (!checkin) {
      return res.status(404).json({ error: 'Invalid or expired QR code' });
    }
    
    await checkin.update({
      status: 'checked_in',
      checkinTime: new Date()
    });
    
    const booking = await Booking.findByPk(checkin.bookingId);
    if (booking) {
      await booking.update({ status: 'attended' });
    }
    
    res.json({ message: 'Checkin successful', checkin });
  } catch (error) {
    console.error('Scan checkin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyCheckins = async (req, res) => {
  try {
    const checkins = await Checkin.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Course,
        include: [{
          model: Coach,
          include: [{
            model: User,
            attributes: ['id', 'name', 'avatar']
          }]
        }]
      }],
      order: [['checkinTime', 'DESC']]
    });
    
    res.json({ checkins });
  } catch (error) {
    console.error('Get my checkins error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  generateCheckinQR,
  scanCheckin,
  getMyCheckins
};
