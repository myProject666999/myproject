import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserGoal } from '../models';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, getActivityMultiplier } from '../utils/bmrCalculator';

interface AuthRequest extends Request {
  userId?: number;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email, gender, age, height, weight } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: '用户名已存在',
      });
      return;
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: '邮箱已被注册',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      gender,
      age,
      height,
      weight,
    });

    const activityLevel = user.activity_level;
    const bmr = calculateBMR(
      Number(user.weight),
      Number(user.height),
      user.age,
      user.gender
    );
    const tdee = calculateTDEE(bmr, activityLevel);
    const calorieGoal = calculateCalorieGoal(tdee, 'maintain');
    const activityMultiplier = getActivityMultiplier(activityLevel);

    await UserGoal.create({
      user_id: user.id,
      daily_calorie_goal: calorieGoal,
      target_weight: Number(user.weight),
      bmr_formula: 'mifflin_st_jeor',
      activity_multiplier: activityMultiplier,
      goal_type: 'maintain',
    });

    const userData = user.toJSON();
    delete (userData as any).password;

    res.status(201).json({
      success: true,
      data: userData,
      message: '注册成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '注册失败',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    const goal = await UserGoal.findOne({ where: { user_id: user.id } });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userData = user.toJSON();
    delete (userData as any).password;

    res.json({
      success: true,
      data: {
        token,
        user: userData,
        goal: goal?.toJSON(),
      },
      message: '登录成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    const userData = user.toJSON();
    delete (userData as any).password;

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    const { username, email, gender, age, height, weight, activity_level } = req.body;

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: '用户名已存在',
        });
        return;
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        res.status(400).json({
          success: false,
          message: '邮箱已被注册',
        });
        return;
      }
    }

    await user.update({
      username: username || user.username,
      email: email || user.email,
      gender: gender || user.gender,
      age: age || user.age,
      height: height || user.height,
      weight: weight || user.weight,
      activity_level: activity_level || user.activity_level,
    });

    const userData = user.toJSON();
    delete (userData as any).password;

    res.json({
      success: true,
      data: userData,
      message: '用户信息更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
};
