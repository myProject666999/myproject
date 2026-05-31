const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { success } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new AppError('用户名、邮箱和密码不能为空', 400));
    }

    const existingUser = await db.getOne('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return next(new AppError('用户名或邮箱已存在', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = await db.insert('users', {
      username,
      email,
      password_hash: passwordHash,
      status: 1
    });

    const teamId = await db.insert('teams', {
      name: `${username}的团队`,
      description: '个人团队',
      created_by: userId
    });

    await db.insert('team_members', {
      team_id: teamId,
      user_id: userId,
      role: 'owner'
    });

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    success(res, {
      user: { id: userId, username, email },
      token
    }, '注册成功', 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('用户名和密码不能为空', 400));
    }

    const user = await db.getOne('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (!user) {
      return next(new AppError('用户名或密码错误', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('用户名或密码错误', 401));
    }

    if (user.status !== 1) {
      return next(new AppError('账号已被禁用', 403));
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    success(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    }, '登录成功');
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    success(res, req.user, '获取成功');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
};
