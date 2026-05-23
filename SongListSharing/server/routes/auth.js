const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { sign } = require('../utils/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    const [exists] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (exists.length > 0) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }
    const hashed = bcrypt.hashSync(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashed, nickname || username]
    );
    const token = sign({ id: result.insertId, username });
    res.json({ code: 0, message: '注册成功', data: { token, user: { id: result.insertId, username, nickname: nickname || username } } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    const user = rows[0];
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    const token = sign({ id: user.id, username: user.username });
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, bio: user.bio }
      }
    });
  } catch (e) { next(e); }
});

module.exports = router;
