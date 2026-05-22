const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../middleware/auth');

router.post('/toggle', auth, subscriptionController.toggleSubscription);
router.get('/', auth, subscriptionController.getSubscriptions);
router.get('/check/:comicId', auth, subscriptionController.checkSubscription);

module.exports = router;
