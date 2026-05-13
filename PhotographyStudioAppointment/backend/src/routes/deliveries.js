const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, deliveryController.list);
router.get('/:id', authenticate, deliveryController.detail);
router.post('/', authenticate, deliveryController.create);
router.put('/:id', authenticate, deliveryController.update);
router.put('/:id/status', authenticate, deliveryController.updateStatus);
router.delete('/:id', authenticate, deliveryController.remove);

module.exports = router;
