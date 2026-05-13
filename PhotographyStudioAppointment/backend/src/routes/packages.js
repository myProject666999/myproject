const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, packageController.list);
router.get('/all', authenticate, packageController.getAll);
router.post('/', authenticate, authorize('admin'), packageController.create);
router.put('/:id', authenticate, authorize('admin'), packageController.update);
router.delete('/:id', authenticate, authorize('admin'), packageController.remove);

module.exports = router;
