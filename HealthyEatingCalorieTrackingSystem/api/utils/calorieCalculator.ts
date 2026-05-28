import { Food } from '../../shared/types';

export const calculateNutrients = (
  food: Food,
  quantity: number
): {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
} => {
  const factor = quantity / 100;
  return {
    calories: Math.round(food.calories_per_100g * factor * 100) / 100,
    protein: Math.round(food.protein * factor * 100) / 100,
    fat: Math.round(food.fat * factor * 100) / 100,
    carbs: Math.round(food.carbs * factor * 100) / 100,
  };
};

export const calculateExerciseCalories = (
  caloriesPerMinute: number,
  durationMinutes: number
): number => {
  return Math.round(caloriesPerMinute * durationMinutes * 100) / 100;
};
