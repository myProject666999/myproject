const { Op } = require('sequelize');
const { User, Recipe } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');

const register = async (ctx) => {
  const { username, email, password } = ctx.request.body;

  if (!username || !email || !password) {
    ctx.status = 400;
    ctx.body = { message: '请填写完整信息' };
    return;
  }

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }]
    }
  });

  if (existingUser) {
    ctx.status = 409;
    ctx.body = { message: '用户名或邮箱已存在' };
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  const token = generateToken({ id: user.id, username: user.username });
  ctx.status = 201;
  ctx.body = {
    message: '注册成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    }
  };
};

const login = async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { message: '请填写用户名和密码' };
    return;
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email: username }]
    }
  });

  if (!user) {
    ctx.status = 401;
    ctx.body = { message: '用户名或密码错误' };
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    ctx.status = 401;
    ctx.body = { message: '用户名或密码错误' };
    return;
  }

  const token = generateToken({ id: user.id, username: user.username });
  ctx.status = 200;
  ctx.body = {
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    }
  };
};

const getProfile = async (ctx) => {
  const userId = ctx.state.user.id;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = { message: '用户不存在' };
    return;
  }

  ctx.status = 200;
  ctx.body = {
    message: '获取成功',
    data: user
  };
};

const updateProfile = async (ctx) => {
  const userId = ctx.state.user.id;
  const { avatar, bio } = ctx.request.body;

  const user = await User.findByPk(userId);
  if (!user) {
    ctx.status = 404;
    ctx.body = { message: '用户不存在' };
    return;
  }

  if (avatar !== undefined) user.avatar = avatar;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  ctx.status = 200;
  ctx.body = {
    message: '更新成功',
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio
    }
  };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
