const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, customerController.list);
router.post('/', authenticate, customerController.create);
router.put('/:id', authenticate, customerController.update);
router.delete('/:id', authenticate, customerController.remove);

module.exports = router;
