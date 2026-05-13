const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, appointmentController.getStats);
router.get('/', authenticate, appointmentController.list);
router.get('/:id', authenticate, appointmentController.detail);
router.post('/', authenticate, appointmentController.create);
router.put('/:id', authenticate, appointmentController.update);
router.put('/:id/status', authenticate, appointmentController.updateStatus);
router.delete('/:id', authenticate, appointmentController.remove);

module.exports = router;
