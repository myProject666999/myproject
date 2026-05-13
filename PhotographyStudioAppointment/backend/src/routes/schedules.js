const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, scheduleController.list);
router.get('/calendar', authenticate, scheduleController.getCalendar);
router.post('/', authenticate, scheduleController.create);
router.put('/:id', authenticate, scheduleController.update);
router.delete('/:id', authenticate, scheduleController.remove);

module.exports = router;
