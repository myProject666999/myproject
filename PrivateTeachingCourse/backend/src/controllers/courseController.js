const { Op } = require('sequelize');
const Course = require('../models/Course');
const Coach = require('../models/Coach');
const User = require('../models/User');

const getAllCourses = async (req, res) => {
  try {
    const { date, coachId, category, status } = req.query;
    
    const where = {};
    if (date) where.date = date;
    if (coachId) where.coachId = coachId;
    if (category) where.category = category;
    if (status) where.status = status;
    
    const courses = await Course.findAll({
      where,
      include: [{
        model: Coach,
        include: [{
          model: User,
          attributes: ['id', 'name', 'avatar']
        }]
      }],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOne({
      where: { id },
      include: [{
        model: Coach,
        include: [{
          model: User,
          attributes: ['id', 'name', 'avatar']
        }]
      }]
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { coachId, name, description, category, date, startTime, endTime, capacity, price, location } = req.body;
    
    const course = await Course.create({
      coachId,
      name,
      description,
      category,
      date,
      startTime,
      endTime,
      capacity,
      price: price || 0,
      location
    });
    
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    await course.update(req.body);
    
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const cancelCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    await course.update({ status: 'cancelled' });
    
    res.json({ message: 'Course cancelled successfully' });
  } catch (error) {
    console.error('Cancel course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  cancelCourse
};
