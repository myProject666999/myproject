export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: number;
  name: string;
  category: string;
  calories_per_100g: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  unit: string;
  created_at: string;
}

export interface MealRecord {
  id: number;
  user_id: number;
  food_id: number;
  food?: Food;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  record_date: string;
  created_at: string;
}

export interface ExerciseRecord {
  id: number;
  user_id: number;
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  record_date: string;
  created_at: string;
}

export interface ExerciseType {
  id: number;
  name: string;
  calories_per_minute: number;
  category: string;
  description: string;
}

export interface WeightRecord {
  id: number;
  user_id: number;
  weight: number;
  record_date: string;
  created_at: string;
}

export interface UserGoal {
  id: number;
  user_id: number;
  daily_calorie_goal: number;
  target_weight: number;
  bmr_formula: 'mifflin_st_jeor' | 'harris_benedict';
  activity_multiplier: number;
  goal_type: 'lose_weight' | 'maintain' | 'gain_weight';
  created_at: string;
  updated_at: string;
}

export interface DailyStat {
  id: number;
  user_id: number;
  stat_date: string;
  total_calories_intake: number;
  total_calories_burned: number;
  calorie_goal: number;
  net_calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  goal: UserGoal;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
}

export interface TrendData {
  date: string;
  total_calories_intake: number;
  total_calories_burned: number;
  net_calories: number;
}

export interface WeightTrendData {
  date: string;
  weight: number;
}
