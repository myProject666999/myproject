const Coach = require('../models/Coach');
const User = require('../models/User');
const SuccessStory = require('../models/SuccessStory');
const Course = require('../models/Course');

const getAllCoaches = async (req, res) => {
  try {
    const coaches = await Coach.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar', 'phone']
      }],
      order: [['rating', 'DESC']]
    });
    
    res.json({ coaches });
  } catch (error) {
    console.error('Get coaches error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCoachById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coach = await Coach.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar', 'phone', 'gender']
        },
        {
          model: SuccessStory
        },
        {
          model: Course,
          where: { status: 'upcoming' },
          required: false
        }
      ]
    });
    
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    
    res.json({ coach });
  } catch (error) {
    console.error('Get coach error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSuccessStories = async (req, res) => {
  try {
    const { coachId } = req.params;
    
    const stories = await SuccessStory.findAll({
      where: { coachId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ stories });
  } catch (error) {
    console.error('Get success stories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllCoaches,
  getCoachById,
  getSuccessStories
};
