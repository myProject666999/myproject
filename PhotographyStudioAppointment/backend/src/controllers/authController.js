const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: '账号已被禁用' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = generateToken(user);

    const { password: _, ...userInfo } = user.toJSON();

    res.json({
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.profile = async (req, res) => {
  try {
    const { password: _, ...userInfo } = req.user.toJSON();
    res.json(userInfo);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '旧密码和新密码不能为空' });
    }

    const isMatch = await req.user.comparePassword(oldPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: '旧密码错误' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
