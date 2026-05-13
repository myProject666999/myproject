const { sequelize } = require('../config/database');
const TrainingRecord = require('../models/TrainingRecord');
const Exercise = require('../models/Exercise');
const Course = require('../models/Course');
const Coach = require('../models/Coach');
const User = require('../models/User');

const getMyTrainingRecords = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { userId: req.user.id };
    
    if (startDate) where.trainingDate = { ...where.trainingDate, [sequelize.Op.gte]: startDate };
    if (endDate) where.trainingDate = { ...where.trainingDate, [sequelize.Op.lte]: endDate };
    
    const records = await TrainingRecord.findAll({
      where,
      include: [
        { model: Exercise },
        {
          model: Course,
          required: false,
          include: [{
            model: Coach,
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
          }]
        }
      ],
      order: [['trainingDate', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.json({ records });
  } catch (error) {
    console.error('Get training records error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTrainingRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await TrainingRecord.findOne({
      where: { id, userId: req.user.id },
      include: [
        { model: Exercise },
        {
          model: Course,
          required: false,
          include: [{
            model: Coach,
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }]
          }]
        }
      ]
    });
    
    if (!record) {
      return res.status(404).json({ error: 'Training record not found' });
    }
    
    res.json({ record });
  } catch (error) {
    console.error('Get training record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createTrainingRecord = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { trainingDate, courseId, notes, totalDuration, exercises } = req.body;
    
    const record = await TrainingRecord.create({
      userId: req.user.id,
      trainingDate,
      courseId: courseId || null,
      notes,
      totalDuration: totalDuration || 0
    }, { transaction: t });
    
    if (exercises && exercises.length > 0) {
      const exerciseData = exercises.map(ex => ({
        trainingRecordId: record.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || 0,
        notes: ex.notes || ''
      }));
      await Exercise.bulkCreate(exerciseData, { transaction: t });
    }
    
    await t.commit();
    
    const createdRecord = await TrainingRecord.findOne({
      where: { id: record.id },
      include: [{ model: Exercise }],
      transaction: t
    });
    
    res.status(201).json({ message: 'Training record created successfully', record: createdRecord });
  } catch (error) {
    await t.rollback();
    console.error('Create training record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTrainingRecord = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { trainingDate, courseId, notes, totalDuration, exercises } = req.body;
    
    const record = await TrainingRecord.findOne({
      where: { id, userId: req.user.id },
      transaction: t
    });
    
    if (!record) {
      await t.rollback();
      return res.status(404).json({ error: 'Training record not found' });
    }
    
    await record.update({
      trainingDate,
      courseId: courseId || null,
      notes,
      totalDuration: totalDuration || 0
    }, { transaction: t });
    
    if (exercises !== undefined) {
      await Exercise.destroy({
        where: { trainingRecordId: id },
        transaction: t
      });
      
      if (exercises.length > 0) {
        const exerciseData = exercises.map(ex => ({
          trainingRecordId: id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || 0,
          notes: ex.notes || ''
        }));
        await Exercise.bulkCreate(exerciseData, { transaction: t });
      }
    }
    
    await t.commit();
    
    const updatedRecord = await TrainingRecord.findOne({
      where: { id },
      include: [{ model: Exercise }]
    });
    
    res.json({ message: 'Training record updated successfully', record: updatedRecord });
  } catch (error) {
    await t.rollback();
    console.error('Update training record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTrainingRecord = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const record = await TrainingRecord.findOne({
      where: { id, userId: req.user.id },
      transaction: t
    });
    
    if (!record) {
      await t.rollback();
      return res.status(404).json({ error: 'Training record not found' });
    }
    
    await Exercise.destroy({
      where: { trainingRecordId: id },
      transaction: t
    });
    
    await record.destroy({ transaction: t });
    
    await t.commit();
    
    res.json({ message: 'Training record deleted successfully' });
  } catch (error) {
    await t.rollback();
    console.error('Delete training record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMyTrainingRecords,
  getTrainingRecordById,
  createTrainingRecord,
  updateTrainingRecord,
  deleteTrainingRecord
};
