const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'camping-reservation-secret-key-2026';

router.post('/register', async (req, res, next) => {
  try {
    const { phone, password, nickname } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该手机号已被注册'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userNickname = nickname || `露营用户${phone.slice(-4)}`;

    const [result] = await pool.query(
      'INSERT INTO users (phone, password, nickname, status) VALUES (?, ?, ?, ?)',
      [phone, hashedPassword, userNickname, 'active']
    );

    const token = jwt.sign(
      { id: result.insertId, phone, nickname: userNickname },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: result.insertId,
          phone,
          nickname: userNickname
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: '手机号或密码错误'
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '手机号或密码错误'
      });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, phone, nickname, avatar, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
});

router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { nickname, avatar } = req.body;
    const updates = [];
    const values = [];

    if (nickname) {
      updates.push('nickname = ?');
      values.push(nickname);
    }

    if (avatar) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的内容'
      });
    }

    values.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
