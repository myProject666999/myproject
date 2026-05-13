const { sequelize } = require('../config/database');
const Booking = require('../models/Booking');
const Course = require('../models/Course');
const Coach = require('../models/Coach');
const User = require('../models/User');

const getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;
    
    const bookings = await Booking.findAll({
      where,
      attributes: ['id', 'courseId', 'userId', 'status', 'createdAt', 'updatedAt'],
      include: [{
        model: Course,
        include: [{
          model: Coach,
          include: [{
            model: User,
            attributes: ['id', 'name', 'avatar']
          }]
        }]
      }]
    });
    
    res.json({ bookings });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findOne({
      where: { id, userId: req.user.id },
      attributes: ['id', 'courseId', 'userId', 'status', 'createdAt', 'updatedAt'],
      include: [{
        model: Course,
        include: [{
          model: Coach,
          include: [{
            model: User,
            attributes: ['id', 'name', 'avatar']
          }]
        }]
      }]
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    
    const course = await Course.findByPk(courseId, { transaction: t });
    if (!course) {
      await t.rollback();
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (course.status !== 'upcoming') {
      await t.rollback();
      return res.status(400).json({ error: 'Course is not available for booking' });
    }
    
    const existingBooking = await Booking.findOne({
      where: { userId, courseId, status: ['confirmed', 'waitlist'] },
      transaction: t
    });
    
    if (existingBooking) {
      await t.rollback();
      return res.status(400).json({ error: 'You have already booked this course' });
    }
    
    const isWaitlist = course.bookedCount >= course.capacity;
    
    const booking = await Booking.create({
      courseId,
      userId,
      status: isWaitlist ? 'waitlist' : 'confirmed',
      waitlistOrder: isWaitlist ? course.bookedCount - course.capacity + 1 : 0
    }, { transaction: t });
    
    if (!isWaitlist) {
      await course.increment('bookedCount', { transaction: t });
    }
    
    await t.commit();
    
    res.status(201).json({
      message: isWaitlist ? 'Added to waitlist successfully' : 'Booking successful',
      booking,
      isWaitlist
    });
  } catch (error) {
    await t.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const booking = await Booking.findOne({
      where: { id, userId: req.user.id },
      include: [Course],
      transaction: t
    });
    
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.status === 'attended' || booking.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ error: 'Cannot cancel this booking' });
    }
    
    const { reason } = req.body;
    await booking.update({ status: 'cancelled', cancelReason: reason }, { transaction: t });
    
    if (booking.status === 'confirmed') {
      await booking.Course.decrement('bookedCount', { transaction: t });
      
      const nextWaitlist = await Booking.findOne({
        where: { courseId: booking.courseId, status: 'waitlist' },
        order: [['waitlistOrder', 'ASC']],
        transaction: t
      });
      
      if (nextWaitlist) {
        await nextWaitlist.update({ status: 'confirmed', waitlistOrder: 0 }, { transaction: t });
      }
    }
    
    await t.commit();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking
};
