const BodyTest = require('../models/BodyTest');

const getMyBodyTests = async (req, res) => {
  try {
    const tests = await BodyTest.findAll({
      where: { userId: req.user.id },
      order: [['testDate', 'DESC']]
    });
    
    res.json({ tests });
  } catch (error) {
    console.error('Get body tests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBodyTestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const test = await BodyTest.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Body test not found' });
    }
    
    res.json({ test });
  } catch (error) {
    console.error('Get body test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const calculateBMI = (weight, height) => {
  if (!weight || !height || height === 0) return null;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

const createBodyTest = async (req, res) => {
  try {
    const { testDate, weight, height, bodyFat, muscleMass, waist, hip, chest, notes } = req.body;
    
    const bmi = calculateBMI(weight, height);
    
    const test = await BodyTest.create({
      userId: req.user.id,
      testDate,
      weight,
      height,
      bmi,
      bodyFat,
      muscleMass,
      waist,
      hip,
      chest,
      notes
    });
    
    res.status(201).json({ message: 'Body test created successfully', test });
  } catch (error) {
    console.error('Create body test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateBodyTest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const test = await BodyTest.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Body test not found' });
    }
    
    const { testDate, weight, height, bodyFat, muscleMass, waist, hip, chest, notes } = req.body;
    
    const bmi = calculateBMI(weight || test.weight, height || test.height);
    
    await test.update({
      testDate,
      weight,
      height,
      bmi,
      bodyFat,
      muscleMass,
      waist,
      hip,
      chest,
      notes
    });
    
    res.json({ message: 'Body test updated successfully', test });
  } catch (error) {
    console.error('Update body test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteBodyTest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const test = await BodyTest.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Body test not found' });
    }
    
    await test.destroy();
    
    res.json({ message: 'Body test deleted successfully' });
  } catch (error) {
    console.error('Delete body test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBodyTestStats = async (req, res) => {
  try {
    const tests = await BodyTest.findAll({
      where: { userId: req.user.id },
      order: [['testDate', 'ASC']]
    });
    
    const stats = {
      dates: tests.map(t => t.testDate),
      weight: tests.map(t => t.weight),
      bmi: tests.map(t => t.bmi),
      bodyFat: tests.map(t => t.bodyFat),
      muscleMass: tests.map(t => t.muscleMass),
      waist: tests.map(t => t.waist),
      hip: tests.map(t => t.hip),
      chest: tests.map(t => t.chest)
    };
    
    res.json({ stats, tests });
  } catch (error) {
    console.error('Get body test stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMyBodyTests,
  getBodyTestById,
  createBodyTest,
  updateBodyTest,
  deleteBodyTest,
  getBodyTestStats
};
