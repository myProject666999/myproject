const bcrypt = require('bcryptjs');
const { User, Worker } = require('../models/associations');
const { generateToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { phone, password, nickName, role = 'user' } = req.body;

    if (!phone || !password) {
      return res.status(400).json(error('手机号和密码不能为空'));
    }

    const existUser = await User.findOne({ where: { phone } });
    if (existUser) {
      return res.status(400).json(error('手机号已注册'));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      phone,
      password: hashedPassword,
      nickName: nickName || `用户${phone.slice(-4)}`,
      role,
    });

    const token = generateToken({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    res.json(success({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickName: user.nickName,
        avatar: user.avatar,
        role: user.role,
      },
    }, '注册成功'));
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json(error('手机号和密码不能为空'));
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(400).json(error('用户不存在'));
    }

    if (user.status !== 1) {
      return res.status(400).json(error('账号已被禁用'));
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(400).json(error('密码错误'));
    }

    const token = generateToken({
      id: user.id,
      phone: user.phone,
      role: user.role,
    });

    let workerInfo = null;
    if (user.role === 'worker') {
      workerInfo = await Worker.findOne({ where: { userId: user.id } });
    }

    res.json(success({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickName: user.nickName,
        avatar: user.avatar,
        role: user.role,
        balance: user.balance,
        worker: workerInfo,
      },
    }, '登录成功'));
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json(error('用户不存在'));
    }

    let workerInfo = null;
    if (user.role === 'worker') {
      workerInfo = await Worker.findOne({ where: { userId: user.id } });
    }

    res.json(success({
      id: user.id,
      phone: user.phone,
      nickName: user.nickName,
      avatar: user.avatar,
      role: user.role,
      balance: user.balance,
      worker: workerInfo,
    }));
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nickName, avatar } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json(error('用户不存在'));
    }

    if (nickName) user.nickName = nickName;
    if (avatar) user.avatar = avatar;
    await user.save();

    res.json(success(null, '更新成功'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
