const express = require('express');
const {
  getMyBodyTests,
  getBodyTestById,
  createBodyTest,
  updateBodyTest,
  deleteBodyTest,
  getBodyTestStats
} = require('../controllers/bodyTestController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyBodyTests);
router.get('/stats', getBodyTestStats);
router.get('/:id', getBodyTestById);
router.post('/', createBodyTest);
router.put('/:id', updateBodyTest);
router.delete('/:id', deleteBodyTest);

module.exports = router;
