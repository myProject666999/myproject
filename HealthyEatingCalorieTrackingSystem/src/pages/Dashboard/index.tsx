import { useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Empty, Spin } from 'antd';
import {
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  Dumbbell,
  Scale,
} from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import CalorieRing from '../../components/Charts/CalorieRing';
import NutrientBar from '../../components/Charts/NutrientBar';
import TrendLine from '../../components/Charts/TrendLine';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

const Dashboard = () => {
  const {
    fetchTodayData,
    fetchTrendData,
    fetchWeightRecords,
    todayMeals,
    todayExercises,
    dailyStats,
    trendData,
    weightTrend,
    loading,
  } = useDataStore();
  const { goal } = useAuthStore();

  useEffect(() => {
    fetchTodayData();
    fetchTrendData(7);
    fetchWeightRecords();
  }, [fetchTodayData, fetchTrendData, fetchWeightRecords]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const mealTypeLabels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };

  const mealTypeColors: Record<string, string> = {
    breakfast: 'blue',
    lunch: 'green',
    dinner: 'orange',
    snack: 'purple',
  };

  const processedWeightData = weightTrend.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          你好，{useAuthStore.getState().user?.username}！
        </h1>
        <p className="text-gray-500">{dayjs().format('YYYY年MM月DD日 dddd')}</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">今日热量概览</h3>
              <div className="flex justify-center mb-4">
                <CalorieRing
                  consumed={dailyStats?.total_calories_intake || 0}
                  goal={goal?.daily_calorie_goal || 2000}
                  size={200}
                />
              </div>
              <Row gutter={8}>
                <Col span={8}>
                  <Statistic
                    title="已摄入"
                    value={dailyStats?.total_calories_intake || 0}
                    suffix="kcal"
                    valueStyle={{ fontSize: '18px', color: '#10B981' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="已消耗"
                    value={dailyStats?.total_calories_burned || 0}
                    suffix="kcal"
                    valueStyle={{ fontSize: '18px', color: '#F59E0B' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="净热量"
                    value={dailyStats?.net_calories || 0}
                    suffix="kcal"
                    valueStyle={{ fontSize: '18px', color: '#3B82F6' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">营养成分分析</h3>
            <NutrientBar
              protein={dailyStats?.protein || 0}
              fat={dailyStats?.fat || 0}
              carbs={dailyStats?.carbs || 0}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">体重趋势</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={processedWeightData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value} kg`, '体重']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6, fill: '#10B981' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-primary-500" />
                <span className="text-xs text-gray-600">
                  当前: {weightTrend[weightTrend.length - 1]?.weight || '--'} kg
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                <span className="text-xs text-gray-600">
                  目标: {goal?.target_weight || '--'} kg
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">近7天热量趋势</h3>
        {trendData.length > 0 ? (
          <TrendLine data={trendData} />
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            className="h-full border-0 shadow-sm hover:shadow-md transition-shadow"
            title={
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={20} className="text-primary-500" />
                <span className="font-semibold">今日饮食记录</span>
              </div>
            }
          >
            {todayMeals.length > 0 ? (
              <List
                dataSource={todayMeals.slice(0, 5)}
                renderItem={(meal) => (
                  <List.Item className="px-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Tag color={mealTypeColors[meal.meal_type]}>
                          {mealTypeLabels[meal.meal_type]}
                        </Tag>
                        <div>
                          <p className="font-medium text-gray-800">
                            {meal.food?.name || '未知食物'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {meal.quantity}g · 蛋白{meal.protein.toFixed(1)}g · 脂肪
                            {meal.fat.toFixed(1)}g · 碳水{meal.carbs.toFixed(1)}g
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary-600">
                        {meal.calories} kcal
                      </span>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="今日暂无饮食记录" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="h-full border-0 shadow-sm hover:shadow-md transition-shadow"
            title={
              <div className="flex items-center gap-2">
                <Dumbbell size={20} className="text-orange-500" />
                <span className="font-semibold">今日运动记录</span>
              </div>
            }
          >
            {todayExercises.length > 0 ? (
              <List
                dataSource={todayExercises.slice(0, 5)}
                renderItem={(exercise) => (
                  <List.Item className="px-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Dumbbell size={20} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {exercise.exercise_type}
                          </p>
                          <p className="text-sm text-gray-500">
                            {exercise.duration_minutes} 分钟
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-orange-600">
                        - {exercise.calories_burned} kcal
                      </span>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="今日暂无运动记录" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
