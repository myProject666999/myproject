import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { User, MealRecord, ExerciseRecord, UserGoal, DailyStat } from '../models';

interface AuthRequest extends Request {
  userId?: number;
}

export const updateDailyStats = async (userId: number, statDate: string): Promise<void> => {
  const mealStats = await MealRecord.findOne({
    where: {
      user_id: userId,
      record_date: statDate,
    },
    attributes: [
      [fn('SUM', col('calories')), 'total_calories'],
      [fn('SUM', col('protein')), 'total_protein'],
      [fn('SUM', col('fat')), 'total_fat'],
      [fn('SUM', col('carbs')), 'total_carbs'],
    ],
    raw: true,
  }) as any;

  const exerciseStats = await ExerciseRecord.findOne({
    where: {
      user_id: userId,
      record_date: statDate,
    },
    attributes: [
      [fn('SUM', col('calories_burned')), 'total_calories_burned'],
    ],
    raw: true,
  }) as any;

  const userGoal = await UserGoal.findOne({
    where: { user_id: userId },
  });

  const totalCaloriesIntake = Number(mealStats?.total_calories || 0);
  const totalCaloriesBurned = Number(exerciseStats?.total_calories_burned || 0);
  const calorieGoal = userGoal?.daily_calorie_goal || 2000;
  const netCalories = totalCaloriesIntake - totalCaloriesBurned;
  const totalProtein = Number(mealStats?.total_protein || 0);
  const totalFat = Number(mealStats?.total_fat || 0);
  const totalCarbs = Number(mealStats?.total_carbs || 0);

  await DailyStat.destroy({
    where: {
      user_id: userId,
      stat_date: statDate,
    },
  });

  await DailyStat.create({
    user_id: userId,
    stat_date: statDate,
    total_calories_intake: totalCaloriesIntake,
    total_calories_burned: totalCaloriesBurned,
    calorie_goal: calorieGoal,
    net_calories: netCalories,
    protein: totalProtein,
    fat: totalFat,
    carbs: totalCarbs,
  });
};

export const getDailyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { date } = req.query;
    const statDate = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

    let stat = await DailyStat.findOne({
      where: {
        user_id: userId,
        stat_date: statDate,
      },
    });

    if (!stat) {
      await updateDailyStats(userId, statDate);
      stat = await DailyStat.findOne({
        where: {
          user_id: userId,
          stat_date: statDate,
        },
      });
    }

    res.json({
      success: true,
      data: stat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取每日统计失败',
    });
  }
};

export const getTrendStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { days = '7' } = req.query;
    const numDays = Number(days);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - numDays + 1);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const stats = await DailyStat.findAll({
      where: {
        user_id: userId,
        stat_date: {
          [Op.between]: [startDateStr, endDateStr],
        },
      },
      order: [['stat_date', 'ASC']],
    });

    const existingDates = stats.map(s => s.stat_date);
    const allStats: typeof stats = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = stats.find(s => s.stat_date === dateStr);
      if (existing) {
        allStats.push(existing);
      } else {
        await updateDailyStats(userId, dateStr);
        const newStat = await DailyStat.findOne({
          where: {
            user_id: userId,
            stat_date: dateStr,
          },
        });
        if (newStat) {
          allStats.push(newStat);
        }
      }
    }

    res.json({
      success: true,
      data: allStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取趋势统计失败',
    });
  }
};

export default {
  getDailyStats,
  getTrendStats,
  updateDailyStats,
};
