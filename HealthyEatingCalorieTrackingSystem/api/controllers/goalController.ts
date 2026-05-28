import { Request, Response } from 'express';
import { User, UserGoal, DailyStat } from '../models';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, getActivityMultiplier } from '../utils/bmrCalculator';

interface AuthRequest extends Request {
  userId?: number;
}

export const getGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    let goal = await UserGoal.findOne({
      where: { user_id: userId },
    });

    if (!goal) {
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: '用户不存在',
        });
        return;
      }

      const bmr = calculateBMR(
        Number(user.weight),
        Number(user.height),
        user.age,
        user.gender
      );
      const tdee = calculateTDEE(bmr, user.activity_level);
      const calorieGoal = calculateCalorieGoal(tdee, 'maintain');
      const activityMultiplier = getActivityMultiplier(user.activity_level);

      goal = await UserGoal.create({
        user_id: userId,
        daily_calorie_goal: calorieGoal,
        target_weight: Number(user.weight),
        bmr_formula: 'mifflin_st_jeor',
        activity_multiplier: activityMultiplier,
        goal_type: 'maintain',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取目标设置失败',
    });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { target_weight, bmr_formula, activity_level, goal_type } = req.body;

    const activityLevel = activity_level || user.activity_level;
    const formula = bmr_formula || 'mifflin_st_jeor';
    const goalType = goal_type || 'maintain';

    const bmr = calculateBMR(
      Number(user.weight),
      Number(user.height),
      user.age,
      user.gender,
      formula
    );
    const tdee = calculateTDEE(bmr, activityLevel);
    const calorieGoal = calculateCalorieGoal(tdee, goalType);
    const activityMultiplier = getActivityMultiplier(activityLevel);

    let goal = await UserGoal.findOne({
      where: { user_id: userId },
    });

    if (goal) {
      await goal.update({
        daily_calorie_goal: calorieGoal,
        target_weight: target_weight !== undefined ? target_weight : goal.target_weight,
        bmr_formula: formula,
        activity_multiplier: activityMultiplier,
        goal_type: goalType,
      });
    } else {
      goal = await UserGoal.create({
        user_id: userId,
        daily_calorie_goal: calorieGoal,
        target_weight: target_weight !== undefined ? target_weight : Number(user.weight),
        bmr_formula: formula,
        activity_multiplier: activityMultiplier,
        goal_type: goalType,
      });
    }

    await DailyStat.update(
      { calorie_goal: calorieGoal },
      { where: { user_id: userId } }
    );

    res.json({
      success: true,
      data: goal,
      message: '目标设置更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新目标设置失败',
    });
  }
};

export default {
  getGoal,
  updateGoal,
};
