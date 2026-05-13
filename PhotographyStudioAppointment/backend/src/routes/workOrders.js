const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, workOrderController.list);
router.get('/:id', authenticate, workOrderController.detail);
router.post('/', authenticate, workOrderController.create);
router.put('/:id', authenticate, workOrderController.update);
router.put('/:id/status', authenticate, workOrderController.updateStatus);
router.delete('/:id', authenticate, workOrderController.remove);

module.exports = router;
