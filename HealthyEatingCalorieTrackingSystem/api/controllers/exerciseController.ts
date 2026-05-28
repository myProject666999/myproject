import { Request, Response } from 'express';
import { ExerciseType, ExerciseRecord } from '../models';
import { calculateExerciseCalories } from '../utils/calorieCalculator';
import { updateDailyStats } from './statsController';

interface AuthRequest extends Request {
  userId?: number;
}

export const getExerciseTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const exerciseTypes = await ExerciseType.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      success: true,
      data: exerciseTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取运动类型列表失败',
    });
  }
};

export const getExercises = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const recordDate = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

    const exercises = await ExerciseRecord.findAll({
      where: {
        user_id: userId,
        record_date: recordDate,
      },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取运动记录失败',
    });
  }
};

export const addExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { exercise_type, duration_minutes, record_date, calories_per_minute } = req.body;

    let caloriesPerMinute = calories_per_minute;
    if (!caloriesPerMinute) {
      const exerciseType = await ExerciseType.findOne({
        where: { name: exercise_type },
      });
      if (exerciseType) {
        caloriesPerMinute = exerciseType.calories_per_minute;
      } else {
        caloriesPerMinute = 5;
      }
    }

    const caloriesBurned = calculateExerciseCalories(caloriesPerMinute, duration_minutes);

    const exercise = await ExerciseRecord.create({
      user_id: userId,
      exercise_type,
      duration_minutes,
      calories_burned: caloriesBurned,
      record_date: record_date || new Date().toISOString().split('T')[0],
    });

    await updateDailyStats(userId, exercise.record_date);

    res.status(201).json({
      success: true,
      data: exercise,
      message: '运动记录添加成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '添加运动记录失败',
    });
  }
};

export const updateExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { id } = req.params;
    const { exercise_type, duration_minutes, record_date, calories_per_minute } = req.body;

    const exercise = await ExerciseRecord.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!exercise) {
      res.status(404).json({
        success: false,
        message: '运动记录不存在',
      });
      return;
    }

    const oldDate = exercise.record_date;

    let caloriesPerMinute = calories_per_minute;
    if (!caloriesPerMinute) {
      const exerciseType = await ExerciseType.findOne({
        where: { name: exercise_type || exercise.exercise_type },
      });
      if (exerciseType) {
        caloriesPerMinute = exerciseType.calories_per_minute;
      } else {
        caloriesPerMinute = 5;
      }
    }

    const newDuration = duration_minutes || exercise.duration_minutes;
    const caloriesBurned = calculateExerciseCalories(caloriesPerMinute, newDuration);

    await exercise.update({
      exercise_type: exercise_type || exercise.exercise_type,
      duration_minutes: newDuration,
      calories_burned: caloriesBurned,
      record_date: record_date || exercise.record_date,
    });

    await updateDailyStats(userId, oldDate);
    if (record_date && record_date !== oldDate) {
      await updateDailyStats(userId, record_date);
    }

    res.json({
      success: true,
      data: exercise,
      message: '运动记录更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新运动记录失败',
    });
  }
};

export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { id } = req.params;

    const exercise = await ExerciseRecord.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!exercise) {
      res.status(404).json({
        success: false,
        message: '运动记录不存在',
      });
      return;
    }

    const recordDate = exercise.record_date;
    await exercise.destroy();

    await updateDailyStats(userId, recordDate);

    res.json({
      success: true,
      message: '运动记录删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除运动记录失败',
    });
  }
};

export default {
  getExerciseTypes,
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
};
