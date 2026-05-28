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
  { id: 21, name: '虾', category: '肉类', calories_per_100g: 93, protein: 18.6, fat: 0.8, carbs: 2.6, fiber: 0, unit: '100g', created_at: '' },
  { id: 22, name: '三文鱼', category: '肉类', calories_per_100g: 208, protein: 17.2, fat: 13.0, carbs: 0, fiber: 0, unit: '100g', created_at: '' },
  { id: 23, name: '豆腐', category: '肉类', calories_per_100g: 81, protein: 8.1, fat: 4.8, carbs: 1.9, fiber: 0.4, unit: '100g', created_at: '' },
  { id: 24, name: '生菜', category: '蔬菜', calories_per_100g: 13, protein: 1.3, fat: 0.3, carbs: 2.0, fiber: 0.7, unit: '100g', created_at: '' },
  { id: 25, name: '胡萝卜', category: '蔬菜', calories_per_100g: 37, protein: 1.0, fat: 0.2, carbs: 8.8, fiber: 2.7, unit: '100g', created_at: '' },
  { id: 26, name: '葡萄', category: '水果', calories_per_100g: 43, protein: 0.5, fat: 0.2, carbs: 10.3, fiber: 0.4, unit: '100g', created_at: '' },
  { id: 27, name: '草莓', category: '水果', calories_per_100g: 32, protein: 1.0, fat: 0.2, carbs: 7.1, fiber: 1.1, unit: '100g', created_at: '' },
  { id: 28, name: '蓝莓', category: '水果', calories_per_100g: 57, protein: 0.7, fat: 0.3, carbs: 14.5, fiber: 2.4, unit: '100g', created_at: '' },
  { id: 29, name: '花生', category: '零食', calories_per_100g: 574, protein: 24.8, fat: 44.3, carbs: 16.2, fiber: 5.5, unit: '100g', created_at: '' },
  { id: 30, name: '杏仁', category: '零食', calories_per_100g: 578, protein: 22.5, fat: 50.6, carbs: 19.9, fiber: 8.0, unit: '100g', created_at: '' },
  { id: 31, name: '巧克力', category: '零食', calories_per_100g: 586, protein: 4.9, fat: 40.2, carbs: 53.4, fiber: 0, unit: '100g', created_at: '' },
  { id: 32, name: '薯片', category: '零食', calories_per_100g: 547, protein: 6.6, fat: 34.6, carbs: 52.9, fiber: 4.7, unit: '100g', created_at: '' },
  { id: 33, name: '可乐', category: '饮料', calories_per_100g: 43, protein: 0, fat: 0, carbs: 10.6, fiber: 0, unit: '100g', created_at: '' },
  { id: 34, name: '绿茶(无糖)', category: '饮料', calories_per_100g: 1, protein: 0.2, fat: 0, carbs: 0, fiber: 0, unit: '100g', created_at: '' },
  { id: 35, name: '咖啡(黑)', category: '饮料', calories_per_100g: 2, protein: 0.3, fat: 0, carbs: 0, fiber: 0, unit: '100g', created_at: '' },
  { id: 36, name: '奶茶', category: '饮料', calories_per_100g: 200, protein: 2.0, fat: 8.0, carbs: 28.0, fiber: 0, unit: '100g', created_at: '' },
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
  { id: 11, name: '深蹲', calories_per_minute: 8.0, category: '力量', description: '深蹲练习' },
  { id: 12, name: '平板支撑', calories_per_minute: 4.0, category: '力量', description: '核心训练' },
  { id: 13, name: '篮球', calories_per_minute: 8.0, category: '有氧', description: '休闲篮球' },
  { id: 14, name: '羽毛球', calories_per_minute: 6.0, category: '有氧', description: '休闲羽毛球' },
  { id: 15, name: '乒乓球', calories_per_minute: 5.0, category: '有氧', description: '休闲乒乓球' },
  { id: 16, name: '足球', calories_per_minute: 9.0, category: '有氧', description: '休闲足球' },
  { id: 17, name: '爬楼梯', calories_per_minute: 9.0, category: '有氧', description: '爬楼梯训练' },
  { id: 18, name: '椭圆机', calories_per_minute: 8.0, category: '有氧', description: '椭圆机中等强度' },
  { id: 19, name: '划船机', calories_per_minute: 7.0, category: '有氧', description: '划船机中等强度' },
  { id: 20, name: '动感单车', calories_per_minute: 8.0, category: '有氧', description: '动感单车训练' },
];

const today = dayjs().format('YYYY-MM-DD');

let mockMeals = [
  { id: 1, user_id: 1, food_id: 1, meal_type: 'breakfast', quantity: 150, calories: 174, protein: 3.9, fat: 0.45, carbs: 38.85, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[0] },
  { id: 2, user_id: 1, food_id: 11, meal_type: 'breakfast', quantity: 60, calories: 86.4, protein: 7.98, fat: 5.28, carbs: 1.68, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[10] },
  { id: 3, user_id: 1, food_id: 12, meal_type: 'breakfast', quantity: 250, calories: 135, protein: 7.5, fat: 8, carbs: 8.5, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[11] },
  { id: 4, user_id: 1, food_id: 7, meal_type: 'lunch', quantity: 200, calories: 198, protein: 2.2, fat: 0.4, carbs: 49.4, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[6] },
  { id: 5, user_id: 1, food_id: 9, meal_type: 'lunch', quantity: 150, calories: 199.5, protein: 29.1, fat: 7.5, carbs: 3.75, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[8] },
  { id: 6, user_id: 1, food_id: 14, meal_type: 'lunch', quantity: 100, calories: 33, protein: 4.1, fat: 0.6, carbs: 4.3, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[13] },
  { id: 7, user_id: 1, food_id: 5, meal_type: 'dinner', quantity: 100, calories: 246, protein: 13, fat: 3.5, carbs: 41, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[4] },
  { id: 8, user_id: 1, food_id: 18, meal_type: 'snack', quantity: 150, calories: 78, protein: 0.3, fat: 0.3, carbs: 20.25, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'), food: mockFoods[17] },
];

let mockExercises = [
  { id: 1, user_id: 1, exercise_type: '跑步', duration_minutes: 30, calories_burned: 300, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') },
  { id: 2, user_id: 1, exercise_type: '力量训练', duration_minutes: 45, calories_burned: 270, record_date: today, created_at: dayjs().format('YYYY-MM-DD HH:mm:ss') },
];

let mockDailyStats = {
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

const recalculateDailyStats = () => {
  const totalCaloriesIntake = mockMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalCaloriesBurned = mockExercises.reduce((sum, exercise) => sum + exercise.calories_burned, 0);
  const totalProtein = mockMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalFat = mockMeals.reduce((sum, meal) => sum + meal.fat, 0);
  const totalCarbs = mockMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  
  mockDailyStats = {
    ...mockDailyStats,
    total_calories_intake: Number(totalCaloriesIntake.toFixed(1)),
    total_calories_burned: Number(totalCaloriesBurned.toFixed(1)),
    net_calories: Number((totalCaloriesIntake - totalCaloriesBurned).toFixed(1)),
    protein: Number(totalProtein.toFixed(2)),
    fat: Number(totalFat.toFixed(2)),
    carbs: Number(totalCarbs.toFixed(2)),
  };
};

let nextMealId = mockMeals.length + 1;
let nextExerciseId = mockExercises.length + 1;

const generateTrendData = (days: number) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('MM-DD');
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
    const date = dayjs().subtract(i, 'day').format('MM-DD');
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

export const mockApiHandler = (url: string, options: RequestInit = {}): Promise<any> => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes('/auth/login') && method === 'POST') {
        resolve({
          success: true,
          data: {
            token: mockToken,
            user: mockUser,
            goal: mockGoal,
          },
          message: '登录成功（演示模式）',
        });
      } else if (url.includes('/auth/register') && method === 'POST') {
        resolve({
          success: true,
          message: '注册成功（演示模式）',
        });
      } else if (url.includes('/auth/profile') && method === 'GET') {
        resolve({
          success: true,
          data: mockUser,
        });
      } else if (url.includes('/auth/profile') && method === 'PUT') {
        resolve({
          success: true,
          data: { ...mockUser, ...body },
          message: '更新成功（演示模式）',
        });
      } else if (url.includes('/foods') && method === 'GET' && !url.match(/\/foods\/\d+/)) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const keyword = urlParams.get('keyword');
        const category = urlParams.get('category');
        let filtered = [...mockFoods];
        if (keyword) {
          filtered = filtered.filter(f => f.name.includes(keyword));
        }
        if (category && category !== '全部') {
          filtered = filtered.filter(f => f.category === category);
        }
        resolve({
          success: true,
          data: filtered,
        });
      } else if (url.match(/\/foods\/\d+/) && method === 'GET') {
        const id = parseInt(url.split('/').pop() || '1');
        const food = mockFoods.find(f => f.id === id);
        resolve({
          success: true,
          data: food || mockFoods[0],
        });
      } else if (url.includes('/meals') && method === 'GET') {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const date = urlParams.get('date');
        let filteredMeals = [...mockMeals];
        if (date) {
          filteredMeals = filteredMeals.filter(m => m.record_date === date);
        }
        resolve({
          success: true,
          data: filteredMeals,
        });
      } else if (url.includes('/meals') && method === 'POST') {
        const food = mockFoods.find(f => f.id === body.food_id);
        if (!food) {
          resolve({
            success: false,
            message: '食物不存在',
          });
          return;
        }
        const newMeal = {
          id: nextMealId++,
          user_id: 1,
          food_id: body.food_id,
          meal_type: body.meal_type,
          quantity: body.quantity,
          calories: Number(((food.calories_per_100g * body.quantity) / 100).toFixed(1)),
          protein: Number(((food.protein * body.quantity) / 100).toFixed(2)),
          fat: Number(((food.fat * body.quantity) / 100).toFixed(2)),
          carbs: Number(((food.carbs * body.quantity) / 100).toFixed(2)),
          record_date: body.record_date || today,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          food: food,
        };
        mockMeals.push(newMeal);
        recalculateDailyStats();
        resolve({
          success: true,
          data: newMeal,
          message: '添加成功（演示模式）',
        });
      } else if (url.match(/\/meals\/\d+/) && method === 'PUT') {
        const mealId = parseInt(url.split('/').pop() || '0');
        const mealIndex = mockMeals.findIndex(m => m.id === mealId);
        if (mealIndex === -1) {
          resolve({
            success: false,
            message: '记录不存在',
          });
          return;
        }
        const meal = mockMeals[mealIndex];
        const food = meal.food || mockFoods.find(f => f.id === meal.food_id);
        if (body.quantity !== undefined && food) {
          meal.quantity = body.quantity;
          meal.calories = Number(((food.calories_per_100g * body.quantity) / 100).toFixed(1));
          meal.protein = Number(((food.protein * body.quantity) / 100).toFixed(2));
          meal.fat = Number(((food.fat * body.quantity) / 100).toFixed(2));
          meal.carbs = Number(((food.carbs * body.quantity) / 100).toFixed(2));
        }
        recalculateDailyStats();
        resolve({
          success: true,
          data: meal,
          message: '更新成功（演示模式）',
        });
      } else if (url.match(/\/meals\/\d+/) && method === 'DELETE') {
        const mealId = parseInt(url.split('/').pop() || '0');
        const mealIndex = mockMeals.findIndex(m => m.id === mealId);
        if (mealIndex === -1) {
          resolve({
            success: false,
            message: '记录不存在',
          });
          return;
        }
        mockMeals.splice(mealIndex, 1);
        recalculateDailyStats();
        resolve({
          success: true,
          message: '删除成功（演示模式）',
        });
      } else if (url.includes('/exercises/types') && method === 'GET') {
        resolve({
          success: true,
          data: mockExerciseTypes,
        });
      } else if (url.includes('/exercises') && method === 'GET') {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const date = urlParams.get('date');
        let filteredExercises = [...mockExercises];
        if (date) {
          filteredExercises = filteredExercises.filter(e => e.record_date === date);
        }
        resolve({
          success: true,
          data: filteredExercises,
        });
      } else if (url.includes('/exercises') && method === 'POST') {
        const exerciseType = mockExerciseTypes.find(t => t.name === body.exercise_type);
        if (!exerciseType) {
          resolve({
            success: false,
            message: '运动类型不存在',
          });
          return;
        }
        const newExercise = {
          id: nextExerciseId++,
          user_id: 1,
          exercise_type: body.exercise_type,
          duration_minutes: body.duration_minutes,
          calories_burned: Math.round(exerciseType.calories_per_minute * body.duration_minutes),
          record_date: body.record_date || today,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        mockExercises.push(newExercise);
        recalculateDailyStats();
        resolve({
          success: true,
          data: newExercise,
          message: '添加成功（演示模式）',
        });
      } else if (url.match(/\/exercises\/\d+/) && method === 'PUT') {
        const exerciseId = parseInt(url.split('/').pop() || '0');
        const exerciseIndex = mockExercises.findIndex(e => e.id === exerciseId);
        if (exerciseIndex === -1) {
          resolve({
            success: false,
            message: '记录不存在',
          });
          return;
        }
        const exercise = mockExercises[exerciseIndex];
        const exerciseType = mockExerciseTypes.find(t => t.name === exercise.exercise_type);
        if (body.duration_minutes !== undefined && exerciseType) {
          exercise.duration_minutes = body.duration_minutes;
          exercise.calories_burned = Math.round(exerciseType.calories_per_minute * body.duration_minutes);
        }
        recalculateDailyStats();
        resolve({
          success: true,
          data: exercise,
          message: '更新成功（演示模式）',
        });
      } else if (url.match(/\/exercises\/\d+/) && method === 'DELETE') {
        const exerciseId = parseInt(url.split('/').pop() || '0');
        const exerciseIndex = mockExercises.findIndex(e => e.id === exerciseId);
        if (exerciseIndex === -1) {
          resolve({
            success: false,
            message: '记录不存在',
          });
          return;
        }
        mockExercises.splice(exerciseIndex, 1);
        recalculateDailyStats();
        resolve({
          success: true,
          message: '删除成功（演示模式）',
        });
      } else if (url.includes('/weights') && method === 'GET') {
        resolve({
          success: true,
          data: mockWeightRecords,
        });
      } else if (url.includes('/weights') && method === 'POST') {
        resolve({
          success: true,
          message: '添加成功（演示模式）',
        });
      } else if (url.includes('/goals') && method === 'GET') {
        resolve({
          success: true,
          data: mockGoal,
        });
      } else if (url.includes('/goals') && method === 'PUT') {
        resolve({
          success: true,
          data: { ...mockGoal, ...body },
          message: '更新成功（演示模式）',
        });
      } else if (url.includes('/stats/daily') && method === 'GET') {
        resolve({
          success: true,
          data: mockDailyStats,
        });
      } else if (url.includes('/stats/trend') && method === 'GET') {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const days = parseInt(urlParams.get('days') || '7');
        resolve({
          success: true,
          data: {
            calorieTrend: generateTrendData(days),
            weightTrend: generateWeightTrend(30),
          },
        });
      } else {
        resolve({
          success: false,
          message: 'API not found',
        });
      }
    }, 300);
  });
};

export default mockApiHandler;
