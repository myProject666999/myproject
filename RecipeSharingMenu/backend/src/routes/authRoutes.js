const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = require('koa-router')();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, authController.updateProfile);

module.exports = router;
