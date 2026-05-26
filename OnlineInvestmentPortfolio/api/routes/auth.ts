import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any;

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, balance) VALUES (?, ?, ?, 100000.00)',
      [username, email, passwordHash]
    ) as any;

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        balance: 100000.00
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请填写用户名和密码' });
    }

    const [users] = await pool.query(
      'SELECT id, username, email, password_hash, balance FROM users WHERE username = ? OR email = ?',
      [username, username]
    ) as any;

    if (users.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
