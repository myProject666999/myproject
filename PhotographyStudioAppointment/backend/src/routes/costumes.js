const express = require('express');
const router = express.Router();
const costumeController = require('../controllers/costumeController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, costumeController.list);
router.get('/all', authenticate, costumeController.getAll);
router.post('/', authenticate, authorize('admin', 'staff'), costumeController.create);
router.put('/:id', authenticate, authorize('admin', 'staff'), costumeController.update);
router.delete('/:id', authenticate, authorize('admin'), costumeController.remove);

module.exports = router;
