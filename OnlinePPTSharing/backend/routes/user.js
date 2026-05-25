const express = require('express');
const UserController = require('../controllers/UserController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', auth, UserController.getProfile);
router.put('/profile', auth, UserController.updateProfile);
router.put('/password', auth, UserController.changePassword);
router.get('/:userId/documents', UserController.getUserDocuments);

module.exports = router;
