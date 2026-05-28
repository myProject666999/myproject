import { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Button,
  List,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  AutoComplete,
  message,
  Popconfirm,
  Empty,
  Spin,
} from 'antd';
import { Plus, Edit2, Trash2, Search, UtensilsCrossed } from 'lucide-react';
import dayjs from 'dayjs';
import { useDataStore } from '../../store/useDataStore';
import type { MealRecord, Food, MealType, AddMealRequest, UpdateMealRequest } from '../../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Meals = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const {
    fetchTodayData,
    fetchFoods,
    addMeal,
    updateMeal,
    deleteMeal,
    todayMeals,
    foods,
    loading,
  } = useDataStore();

  useEffect(() => {
    fetchTodayData(selectedDate);
    fetchFoods();
  }, [fetchTodayData, fetchFoods, selectedDate]);

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };

  const mealTypeColors: Record<MealType, string> = {
    breakfast: 'blue',
    lunch: 'green',
    dinner: 'orange',
    snack: 'purple',
  };

  const groupedMeals = todayMeals.reduce(
    (acc, meal) => {
      const type = meal.meal_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(meal);
      return acc;
    },
    {} as Record<MealType, MealRecord[]>
  );

  const mealTypeOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  const handleSearchFood = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      await fetchFoods(keyword.trim());
    } else {
      await fetchFoods();
    }
  };

  const handleSelectFood = (value: string, option: any) => {
    const food = foods.find((f) => f.id === option.dataId);
    setSelectedFood(food || null);
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setSelectedFood(null);
    form.resetFields();
    form.setFieldsValue({
      meal_type: 'breakfast',
      quantity: 100,
    });
    setIsModalOpen(true);
  };

  const handleEditMeal = (meal: MealRecord) => {
    setEditingMeal(meal);
    setSelectedFood(meal.food || null);
    form.setFieldsValue({
      food_id: meal.food_id,
      meal_type: meal.meal_type,
      quantity: meal.quantity,
    });
    setIsModalOpen(true);
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await deleteMeal(id);
      message.success('删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMeal) {
        const updateData: UpdateMealRequest = {
          quantity: values.quantity,
        };
        await updateMeal(editingMeal.id, updateData);
        message.success('更新成功');
      } else {
        const addData: AddMealRequest = {
          food_id: values.food_id,
          meal_type: values.meal_type,
          quantity: values.quantity,
          record_date: selectedDate,
        };
        await addMeal(addData);
        message.success('添加成功');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const foodOptions = foods.map((food) => ({
    value: food.name,
    label: (
      <div className="flex justify-between items-center">
        <span>{food.name}</span>
        <span className="text-gray-400 text-sm">{food.calories_per_100g} kcal/100g</span>
      </div>
    ),
    dataId: food.id,
  }));

  const calculateCalories = () => {
    if (!selectedFood) return 0;
    const quantity = form.getFieldValue('quantity') || 0;
    return Math.round((selectedFood.calories_per_100g * quantity) / 100);
  };

  const calculateNutrients = () => {
    if (!selectedFood) return { protein: 0, fat: 0, carbs: 0 };
    const quantity = form.getFieldValue('quantity') || 0;
    return {
      protein: Number(((selectedFood.protein * quantity) / 100).toFixed(1)),
      fat: Number(((selectedFood.fat * quantity) / 100).toFixed(1)),
      carbs: Number(((selectedFood.carbs * quantity) / 100).toFixed(1)),
    };
  };

  if (loading && todayMeals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">饮食记录</h1>
          <p className="text-gray-500">记录您的每日饮食，追踪营养摄入</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={(date) => date && setSelectedDate(date.format('YYYY-MM-DD'))}
            className="w-full md:w-auto"
          />
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleAddMeal}
            className="bg-primary-500 hover:bg-primary-600 border-none h-10 px-4"
          >
            添加记录
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {mealTypeOrder.map((type) => (
          <Card
            key={type}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
            title={
              <div className="flex items-center gap-2">
                <Tag color={mealTypeColors[type]} className="m-0">
                  {mealTypeLabels[type]}
                </Tag>
                <span className="text-gray-500 text-sm font-normal">
                  {groupedMeals[type]?.length || 0} 条记录
                </span>
                <span className="ml-auto text-primary-600 font-semibold">
                  {groupedMeals[type]?.reduce((sum, meal) => sum + meal.calories, 0) || 0} kcal
                </span>
              </div>
            }
          >
            {groupedMeals[type] && groupedMeals[type].length > 0 ? (
              <List
                dataSource={groupedMeals[type]}
                renderItem={(meal) => (
                  <List.Item
                    className="px-0 py-3 border-b border-gray-50 last:border-0"
                    actions={[
                      <Button
                        key="edit"
                        type="text"
                        icon={<Edit2 size={16} />}
                        onClick={() => handleEditMeal(meal)}
                        className="text-blue-500 hover:text-blue-600"
                      />,
                      <Popconfirm
                        key="delete"
                        title="确定要删除这条记录吗？"
                        onConfirm={() => handleDeleteMeal(meal.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="text"
                          icon={<Trash2 size={16} />}
                          className="text-red-500 hover:text-red-600"
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <UtensilsCrossed size={20} className="text-primary-500" />
                        </div>
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
              <Empty description={`暂无${mealTypeLabels[type]}记录`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        ))}
      </div>

      <Modal
        title={editingMeal ? '编辑饮食记录' : '添加饮食记录'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingMeal ? '更新' : '添加'}
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" size="large">
          {!editingMeal && (
            <Form.Item
              name="food_id"
              label="选择食物"
              rules={[{ required: true, message: '请选择食物' }]}
            >
              <AutoComplete
                options={foodOptions}
                onSearch={handleSearchFood}
                onSelect={handleSelectFood}
                placeholder="搜索食物名称..."
                size="large"
                notFoundContent={
                  <div className="p-4 text-center text-gray-400">
                    <Search size={24} className="mx-auto mb-2 opacity-50" />
                    <p>未找到相关食物</p>
                  </div>
                }
              />
            </Form.Item>
          )}

          <Form.Item
            name="meal_type"
            label="餐次"
            rules={[{ required: true, message: '请选择餐次' }]}
          >
            <Select size="large">
              <Option value="breakfast">早餐</Option>
              <Option value="lunch">午餐</Option>
              <Option value="dinner">晚餐</Option>
              <Option value="snack">加餐</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="食用数量 (克)"
            rules={[
              { required: true, message: '请输入食用数量' },
              { type: 'number', min: 1, message: '数量必须大于0' },
            ]}
          >
            <InputNumber
              min={1}
              max={10000}
              placeholder="请输入食用数量"
              className="w-full h-10"
              addonAfter="g"
              onChange={() => form.setFieldsValue({ ...form.getFieldsValue() })}
            />
          </Form.Item>

          {selectedFood && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600 font-medium">营养估算</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">热量：</span>
                  <span className="font-semibold text-primary-600">{calculateCalories()} kcal</span>
                </div>
                <div>
                  <span className="text-gray-500">蛋白质：</span>
                  <span className="font-semibold text-green-600">{calculateNutrients().protein}g</span>
                </div>
                <div>
                  <span className="text-gray-500">脂肪：</span>
                  <span className="font-semibold text-blue-600">{calculateNutrients().fat}g</span>
                </div>
                <div>
                  <span className="text-gray-500">碳水：</span>
                  <span className="font-semibold text-orange-600">{calculateNutrients().carbs}g</span>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Meals;
