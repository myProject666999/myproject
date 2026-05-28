import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';

const mockUser = {
  id: 1,
  username: 'demo',
  email: 'demo@example.com',
  gender: 'male',
  age: 28,
  height: 175,
  weight: 70,
  activity_level: 'moderate',
  created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

const mockGoal = {
  id: 1,
  user_id: 1,
  daily_calorie_goal: 2000,
  target_weight: 68,
  bmr_formula: 'mifflin_st_jeor',
  activity_multiplier: 1.55,
  goal_type: 'lose_weight',
  created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

const mockFoods = [
  { id: 1, name: '白米饭', category: '主食', calories_per_100g: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3, unit: '100g', created_at: '' },
  { id: 2, name: '糙米饭', category: '主食', calories_per_100g: 123, protein: 2.6, fat: 0.9, carbs: 25.6, fiber: 1.8, unit: '100g', created_at: '' },
  { id: 3, name: '面条(煮)', category: '主食', calories_per_100g: 109, protein: 3.6, fat: 0.6, carbs: 22.0, fiber: 1.2, unit: '100g', created_at: '' },
  { id: 4, name: '馒头', category: '主食', calories_per_100g: 223, protein: 7.0, fat: 1.1, carbs: 47.0, fiber: 1.3, unit: '100g', created_at: '' },
  { id: 5, name: '全麦面包', category: '主食', calories_per_100g: 246, protein: 13.0, fat: 3.5, carbs: 41.0, fiber: 7.0, unit: '100g', created_at: '' },
  { id: 6, name: '燕麦片', category: '主食', calories_per_100g: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6, unit: '100g', created_at: '' },
  { id: 7, name: '红薯', category: '主食', calories_per_100g: 99, protein: 1.1, fat: 0.2, carbs: 24.7, fiber: 2.2, unit: '100g', created_at: '' },
  { id: 8, name: '玉米', category: '主食', calories_per_100g: 112, protein: 4.0, fat: 1.2, carbs: 22.8, fiber: 2.9, unit: '100g', created_at: '' },
  { id: 9, name: '鸡胸肉', category: '肉类', calories_per_100g: 133, protein: 19.4, fat: 5.0, carbs: 2.5, fiber: 0, unit: '100g', created_at: '' },
  { id: 10, name: '牛肉(瘦)', category: '肉类', calories_per_100g: 125, protein: 20.2, fat: 3.2, carbs: 0, fiber: 0, unit: '100g', created_at: '' },
  { id: 11, name: '鸡蛋', category: '肉类', calories_per_100g: 144, protein: 13.3, fat: 8.8, carbs: 2.8, fiber: 0, unit: '100g', created_at: '' },
  { id: 12, name: '牛奶', category: '乳制品', calories_per_100g: 54, protein: 3.0, fat: 3.2, carbs: 3.4, fiber: 0, unit: '100g', created_at: '' },
  { id: 13, name: '酸奶', category: '乳制品', calories_per_100g: 72, protein: 2.5, fat: 2.7, carbs: 9.3, fiber: 0, unit: '100g', created_at: '' },
  { id: 14, name: '西兰花', category: '蔬菜', calories_per_100g: 33, protein: 4.1, fat: 0.6, carbs: 4.3, fiber: 1.6, unit: '100g', created_at: '' },
  { id: 15, name: '菠菜', category: '蔬菜', calories_per_100g: 24, protein: 2.6, fat: 0.3, carbs: 4.5, fiber: 2.4, unit: '100g', created_at: '' },
  { id: 16, name: '西红柿', category: '蔬菜', calories_per_100g: 19, protein: 0.9, fat: 0.2, carbs: 4.0, fiber: 0.5, unit: '100g', created_at: '' },
  { id: 17, name: '黄瓜', category: '蔬菜', calories_per_100g: 15, protein: 0.8, fat: 0.2, carbs: 2.9, fiber: 0.5, unit: '100g', created_at: '' },
  { id: 18, name: '苹果', category: '水果', calories_per_100g: 52, protein: 0.2, fat: 0.2, carbs: 13.5, fiber: 1.2, unit: '100g', created_at: '' },
  { id: 19, name: '香蕉', category: '水果', calories_per_100g: 89, protein: 1.4, fat: 0.2, carbs: 22.0, fiber: 2.6, unit: '100g', created_at: '' },
  { id: 20, name: '橙子', category: '水果', calories_per_100g: 47, protein: 0.8, fat: 0.2, carbs: 11.1, fiber: 2.0, unit: '100g', created_at: '' },
];

const mockExerciseTypes = [
  { id: 1, name: '散步', calories_per_minute: 3.5, category: '有氧', description: '慢速散步，心率较低' },
  { id: 2, name: '快走', calories_per_minute: 6.0, category: '有氧', description: '快步走，微微出汗' },
  { id: 3, name: '跑步', calories_per_minute: 10.0, category: '有氧', description: '中等强度跑步' },
  { id: 4, name: '慢跑', calories_per_minute: 8.0, category: '有氧', description: '轻松慢跑' },
  { id: 5, name: '骑自行车', calories_per_minute: 7.0, category: '有氧', description: '中等速度骑行' },
  { id: 6, name: '游泳', calories_per_minute: 10.0, category: '有氧', description: '自由泳中等强度' },
  { id: 7, name: '跳绳', calories_per_minute: 12.0, category: '有氧', description: '中等速度跳绳' },
  { id: 8, name: '瑜伽', calories_per_minute: 3.0, category: '柔韧', description: '普通瑜伽练习' },
  { id: 9, name: '力量训练', calories_per_minute: 6.0, category: '力量', description: '健身房器械训练' },
  { id: 10, name: '俯卧撑', calories_per_minute: 7.0, category: '力量', description: '俯卧撑训练' },
];

const today = dayjs().format('YYYY-MM-DD');

const mockMeals = [
  { id: 1, user_id: 1, food_id: 1, meal_type: 'breakfast', quantity: 150, calories: 174, protein: 3.9, fat: 0.45, carbs: 38.85, record_date: today, created_at: '', food: mockFoods[0] },
  { id: 2, user_id: 1, food_id: 11, meal_type: 'breakfast', quantity: 60, calories: 86.4, protein: 7.98, fat: 5.28, carbs: 1.68, record_date: today, created_at: '', food: mockFoods[10] },
  { id: 3, user_id: 1, food_id: 12, meal_type: 'breakfast', quantity: 250, calories: 135, protein: 7.5, fat: 8, carbs: 8.5, record_date: today, created_at: '', food: mockFoods[11] },
  { id: 4, user_id: 1, food_id: 7, meal_type: 'lunch', quantity: 200, calories: 198, protein: 2.2, fat: 0.4, carbs: 49.4, record_date: today, created_at: '', food: mockFoods[6] },
  { id: 5, user_id: 1, food_id: 9, meal_type: 'lunch', quantity: 150, calories: 199.5, protein: 29.1, fat: 7.5, carbs: 3.75, record_date: today, created_at: '', food: mockFoods[8] },
  { id: 6, user_id: 1, food_id: 14, meal_type: 'lunch', quantity: 100, calories: 33, protein: 4.1, fat: 0.6, carbs: 4.3, record_date: today, created_at: '', food: mockFoods[13] },
  { id: 7, user_id: 1, food_id: 5, meal_type: 'dinner', quantity: 100, calories: 246, protein: 13, fat: 3.5, carbs: 41, record_date: today, created_at: '', food: mockFoods[4] },
  { id: 8, user_id: 1, food_id: 18, meal_type: 'snack', quantity: 150, calories: 78, protein: 0.3, fat: 0.3, carbs: 20.25, record_date: today, created_at: '', food: mockFoods[17] },
];

const mockExercises = [
  { id: 1, user_id: 1, exercise_type: '跑步', duration_minutes: 30, calories_burned: 300, record_date: today, created_at: '' },
  { id: 2, user_id: 1, exercise_type: '力量训练', duration_minutes: 45, calories_burned: 270, record_date: today, created_at: '' },
];

const mockDailyStats = {
  id: 1,
  user_id: 1,
  stat_date: today,
  total_calories_intake: 1149.9,
  total_calories_burned: 570,
  calorie_goal: 2000,
  net_calories: 579.9,
  protein: 68.58,
  fat: 25.93,
  carbs: 167.73,
  created_at: '',
  updated_at: '',
};

const generateTrendData = (days: number) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    const intake = Math.round(1000 + Math.random() * 500);
    const burned = Math.round(200 + Math.random() * 400);
    data.push({
      date,
      total_calories_intake: intake,
      total_calories_burned: burned,
      net_calories: intake - burned,
    });
  }
  return data;
};

const generateWeightTrend = (days: number) => {
  const data = [];
  let weight = 72;
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    weight = weight - Math.random() * 0.1;
    data.push({
      date,
      weight: Math.round(weight * 10) / 10,
    });
  }
  return data;
};

const mockWeightRecords = generateWeightTrend(30);

const mockToken = 'mock-jwt-token-for-demo-purpose';

export const mockDataMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  const method = req.method;

  if (path === '/auth/login' && method === 'POST') {
    return res.json({
      success: true,
      data: {
        token: mockToken,
        user: mockUser,
        goal: mockGoal,
      },
      message: '登录成功（演示模式）',
    });
  }

  if (path === '/auth/register' && method === 'POST') {
    return res.json({
      success: true,
      message: '注册成功（演示模式）',
    });
  }

  if (path === '/auth/profile' && method === 'GET') {
    return res.json({
      success: true,
      data: mockUser,
    });
  }

  if (path === '/auth/profile' && method === 'PUT') {
    return res.json({
      success: true,
      data: { ...mockUser, ...req.body },
      message: '更新成功（演示模式）',
    });
  }

  if (path === '/foods' && method === 'GET') {
    const { keyword, category } = req.query;
    let filtered = mockFoods;
    if (keyword) {
      filtered = filtered.filter(f => f.name.includes(keyword as string));
    }
    if (category && category !== '全部') {
      filtered = filtered.filter(f => f.category === category);
    }
    return res.json({
      success: true,
      data: filtered,
    });
  }

  if (path.match(/^\/foods\/\d+$/) && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const food = mockFoods.find(f => f.id === id);
    return res.json({
      success: true,
      data: food || mockFoods[0],
    });
  }

  if (path === '/meals' && method === 'GET') {
    return res.json({
      success: true,
      data: mockMeals,
    });
  }

  if (path === '/meals' && method === 'POST') {
    return res.json({
      success: true,
      message: '添加成功（演示模式）',
    });
  }

  if (path.match(/^\/meals\/\d+$/) && method === 'PUT') {
    return res.json({
      success: true,
      message: '更新成功（演示模式）',
    });
  }

  if (path.match(/^\/meals\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: '删除成功（演示模式）',
    });
  }

  if (path === '/exercises/types' && method === 'GET') {
    return res.json({
      success: true,
      data: mockExerciseTypes,
    });
  }

  if (path === '/exercises' && method === 'GET') {
    return res.json({
      success: true,
      data: mockExercises,
    });
  }

  if (path === '/exercises' && method === 'POST') {
    return res.json({
      success: true,
      message: '添加成功（演示模式）',
    });
  }

  if (path.match(/^\/exercises\/\d+$/) && method === 'PUT') {
    return res.json({
      success: true,
      message: '更新成功（演示模式）',
    });
  }

  if (path.match(/^\/exercises\/\d+$/) && method === 'DELETE') {
    return res.json({
      success: true,
      message: '删除成功（演示模式）',
    });
  }

  if (path === '/weights' && method === 'GET') {
    return res.json({
      success: true,
      data: mockWeightRecords,
    });
  }

  if (path === '/weights' && method === 'POST') {
    return res.json({
      success: true,
      message: '添加成功（演示模式）',
    });
  }

  if (path === '/goals' && method === 'GET') {
    return res.json({
      success: true,
      data: mockGoal,
    });
  }

  if (path === '/goals' && method === 'PUT') {
    return res.json({
      success: true,
      data: { ...mockGoal, ...req.body },
      message: '更新成功（演示模式）',
    });
  }

  if (path === '/stats/daily' && method === 'GET') {
    return res.json({
      success: true,
      data: mockDailyStats,
    });
  }

  if (path === '/stats/trend' && method === 'GET') {
    const days = parseInt(req.query.days as string) || 7;
    return res.json({
      success: true,
      data: {
        calorieTrend: generateTrendData(days),
        weightTrend: generateWeightTrend(30),
      },
    });
  }

  next();
};

export default mockDataMiddleware;
