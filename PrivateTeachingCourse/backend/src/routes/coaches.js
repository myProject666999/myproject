const express = require('express');
const {
  getAllCoaches,
  getCoachById,
  getSuccessStories
} = require('../controllers/coachController');

const router = express.Router();

router.get('/', getAllCoaches);
router.get('/:id', getCoachById);
router.get('/:coachId/stories', getSuccessStories);

module.exports = router;
