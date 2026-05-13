const express = require('express');
const {
  getMyTrainingRecords,
  getTrainingRecordById,
  createTrainingRecord,
  updateTrainingRecord,
  deleteTrainingRecord
} = require('../controllers/trainingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyTrainingRecords);
router.get('/:id', getTrainingRecordById);
router.post('/', createTrainingRecord);
router.put('/:id', updateTrainingRecord);
router.delete('/:id', deleteTrainingRecord);

module.exports = router;
