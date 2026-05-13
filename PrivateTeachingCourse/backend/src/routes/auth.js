const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  body('name').notEmpty().withMessage('请输入姓名')
], register);

router.post('/login', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('password').notEmpty().withMessage('请输入密码')
], login);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

module.exports = router;
