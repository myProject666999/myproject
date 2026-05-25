const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Document, Like, Favorite } = require('../models');
const { Op } = require('sequelize');

class UserController {
  static async register(req, res) {
    try {
      const { username, password, email, nickname } = req.body;

      if (!username || !password || !email) {
        return res.status(400).json({ code: 400, message: '请填写必填项' });
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({ code: 400, message: '用户名或邮箱已存在' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        password: hashedPassword,
        email,
        nickname: nickname || username
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        code: 200,
        message: '注册成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ code: 400, message: '请填写用户名和密码' });
      }

      const user = await User.findOne({
        where: { username }
      });

      if (!user) {
        return res.status(401).json({ code: 401, message: '用户名或密码错误' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ code: 401, message: '用户名或密码错误' });
      }

      if (user.status !== 1) {
        return res.status(403).json({ code: 403, message: '账号已被禁用' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = req.user;

      const docCount = await Document.count({ where: { user_id: user.id } });
      const likeCount = await Like.count({ where: { user_id: user.id } });
      const favoriteCount = await Favorite.count({ where: { user_id: user.id } });

      res.json({
        code: 200,
        data: {
          user: {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio
          },
          stats: {
            document_count: docCount,
            like_count: likeCount,
            favorite_count: favoriteCount
          }
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { nickname, avatar, bio, email } = req.body;
      const user = req.user;

      const updateData = {};
      if (nickname) updateData.nickname = nickname;
      if (avatar) updateData.avatar = avatar;
      if (bio !== undefined) updateData.bio = bio;
      if (email) updateData.email = email;

      await User.update(updateData, {
        where: { id: user.id }
      });

      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });

      res.json({
        code: 200,
        message: '更新成功',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user;

      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ code: 400, message: '原密码错误' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.update({ password: hashedPassword }, {
        where: { id: user.id }
      });

      res.json({ code: 200, message: '密码修改成功' });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }

  static async getUserDocuments(req, res) {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      const { count, rows } = await Document.findAndCountAll({
        where: { user_id: userId, status: 1 },
        include: [
          { model: require('../models').User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
          { model: require('../models').Category, as: 'category', attributes: ['id', 'name', 'icon'] }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      res.json({
        code: 200,
        data: {
          list: rows,
          total: count,
          page,
          limit
        }
      });
    } catch (error) {
      console.error('获取用户文档失败:', error);
      res.status(500).json({ code: 500, message: '服务器错误' });
    }
  }
}

module.exports = UserController;
