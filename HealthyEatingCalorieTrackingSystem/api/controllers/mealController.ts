import { Request, Response } from 'express';
import { Food, MealRecord } from '../models';
import { calculateNutrients } from '../utils/calorieCalculator';
import { updateDailyStats } from './statsController';

interface AuthRequest extends Request {
  userId?: number;
}

export const getMeals = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const meals = await MealRecord.findAll({
      where: {
        user_id: userId,
        record_date: recordDate,
      },
      include: [
        {
          model: Food,
          as: 'food',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: meals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取饮食记录失败',
    });
  }
};

export const addMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '用户未认证',
      });
      return;
    }

    const { food_id, meal_type, quantity, record_date } = req.body;

    const food = await Food.findByPk(food_id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: '食物不存在',
      });
      return;
    }

    const nutrients = calculateNutrients(food.toJSON(), quantity);

    const meal = await MealRecord.create({
      user_id: userId,
      food_id,
      meal_type,
      quantity,
      calories: nutrients.calories,
      protein: nutrients.protein,
      fat: nutrients.fat,
      carbs: nutrients.carbs,
      record_date: record_date || new Date().toISOString().split('T')[0],
    });

    await updateDailyStats(userId, meal.record_date);

    const mealWithFood = await MealRecord.findByPk(meal.id, {
      include: [
        {
          model: Food,
          as: 'food',
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: mealWithFood,
      message: '饮食记录添加成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '添加饮食记录失败',
    });
  }
};

export const updateMeal = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const { meal_type, quantity, record_date } = req.body;

    const meal = await MealRecord.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!meal) {
      res.status(404).json({
        success: false,
        message: '饮食记录不存在',
      });
      return;
    }

    const oldDate = meal.record_date;

    const food = await Food.findByPk(meal.food_id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: '食物不存在',
      });
      return;
    }

    const newQuantity = quantity || meal.quantity;
    const nutrients = calculateNutrients(food.toJSON(), newQuantity);

    await meal.update({
      meal_type: meal_type || meal.meal_type,
      quantity: newQuantity,
      calories: nutrients.calories,
      protein: nutrients.protein,
      fat: nutrients.fat,
      carbs: nutrients.carbs,
      record_date: record_date || meal.record_date,
    });

    await updateDailyStats(userId, oldDate);
    if (record_date && record_date !== oldDate) {
      await updateDailyStats(userId, record_date);
    }

    const updatedMeal = await MealRecord.findByPk(meal.id, {
      include: [
        {
          model: Food,
          as: 'food',
        },
      ],
    });

    res.json({
      success: true,
      data: updatedMeal,
      message: '饮食记录更新成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新饮食记录失败',
    });
  }
};

export const deleteMeal = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const meal = await MealRecord.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!meal) {
      res.status(404).json({
        success: false,
        message: '饮食记录不存在',
      });
      return;
    }

    const recordDate = meal.record_date;
    await meal.destroy();

    await updateDailyStats(userId, recordDate);

    res.json({
      success: true,
      message: '饮食记录删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除饮食记录失败',
    });
  }
};

export default {
  getMeals,
  addMeal,
  updateMeal,
  deleteMeal,
};
