const { query } = require('../config/database');

async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;
    const bcrypt = require('bcryptjs');
    
    const existing = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'author' ? 'author' : 'reader';
    
    const result = await query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, userRole]
    );
    
    const { generateToken } = require('../middleware/auth');
    const token = generateToken({ id: result.insertId, username, role: userRole });
    
    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: result.insertId, username, email, role: userRole }
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败', message: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const bcrypt = require('bcryptjs');
    
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const { generateToken } = require('../middleware/auth');
    const token = generateToken(user);
    
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败', message: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const users = await query(
      'SELECT id, username, email, avatar, role, bio, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败', message: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { bio, email } = req.body;
    
    const updates = [];
    const params = [];
    
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (req.file) {
      updates.push('avatar = ?');
      params.push(`/uploads/avatars/${req.file.filename}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要更新的内容' });
    }
    
    params.push(userId);
    
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    
    const users = await query(
      'SELECT id, username, email, avatar, role, bio FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ message: '更新成功', user: users[0] });
  } catch (error) {
    res.status(500).json({ error: '更新失败', message: error.message });
  }
}

module.exports = { register, login, getProfile, updateProfile };
