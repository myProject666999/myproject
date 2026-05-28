export type {
  ApiResponse,
  User,
  Food,
  MealRecord,
  ExerciseRecord,
  ExerciseType,
  WeightRecord,
  UserGoal,
  DailyStat,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TrendData,
  WeightTrendData,
} from '../../shared/types';

export interface UpdateProfileRequest {
  email?: string;
  gender?: 'male' | 'female';
  age?: number;
  height?: number;
  weight?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface UpdateGoalRequest {
  daily_calorie_goal?: number;
  target_weight?: number;
  goal_type?: 'lose_weight' | 'maintain' | 'gain_weight';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface GetFoodsParams {
  keyword?: string;
  category?: string;
}

export interface GetMealsParams {
  date: string;
}

export interface AddMealRequest {
  food_id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  record_date: string;
}

export interface UpdateMealRequest {
  quantity: number;
}

export interface GetExercisesParams {
  date: string;
}

export interface AddExerciseRequest {
  exercise_type: string;
  duration_minutes: number;
  record_date: string;
}

export interface UpdateExerciseRequest {
  duration_minutes: number;
}

export interface AddWeightRequest {
  weight: number;
  record_date: string;
}

export interface GetDailyStatsParams {
  date: string;
}

export interface GetTrendStatsParams {
  days?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose_weight' | 'maintain' | 'gain_weight';
export type Gender = 'male' | 'female';
