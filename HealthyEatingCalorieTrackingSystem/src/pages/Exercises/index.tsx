import { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Button,
  List,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Empty,
  Spin,
} from 'antd';
import { Plus, Edit2, Trash2, Dumbbell, Flame } from 'lucide-react';
import dayjs from 'dayjs';
import { useDataStore } from '../../store/useDataStore';
import type {
  ExerciseRecord,
  ExerciseType,
  AddExerciseRequest,
  UpdateExerciseRequest,
} from '../../types';

const { Option } = Select;

const Exercises = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseRecord | null>(null);
  const [form] = Form.useForm();
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType | null>(null);

  const {
    fetchTodayData,
    fetchExerciseTypes,
    addExercise,
    updateExercise,
    deleteExercise,
    todayExercises,
    exerciseTypes,
    loading,
  } = useDataStore();

  useEffect(() => {
    fetchTodayData(selectedDate);
    fetchExerciseTypes();
  }, [fetchTodayData, fetchExerciseTypes, selectedDate]);

  const handleAddExercise = () => {
    setEditingExercise(null);
    setSelectedExerciseType(null);
    form.resetFields();
    form.setFieldsValue({
      duration_minutes: 30,
    });
    setIsModalOpen(true);
  };

  const handleEditExercise = (exercise: ExerciseRecord) => {
    setEditingExercise(exercise);
    const exType = exerciseTypes.find((t) => t.name === exercise.exercise_type);
    setSelectedExerciseType(exType || null);
    form.setFieldsValue({
      exercise_type: exercise.exercise_type,
      duration_minutes: exercise.duration_minutes,
    });
    setIsModalOpen(true);
  };

  const handleDeleteExercise = async (id: number) => {
    try {
      await deleteExercise(id);
      message.success('删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleSelectExerciseType = (value: string) => {
    const exType = exerciseTypes.find((t) => t.name === value);
    setSelectedExerciseType(exType || null);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingExercise) {
        const updateData: UpdateExerciseRequest = {
          duration_minutes: values.duration_minutes,
        };
        await updateExercise(editingExercise.id, updateData);
        message.success('更新成功');
      } else {
        const addData: AddExerciseRequest = {
          exercise_type: values.exercise_type,
          duration_minutes: values.duration_minutes,
          record_date: selectedDate,
        };
        await addExercise(addData);
        message.success('添加成功');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const calculateCaloriesBurned = () => {
    if (!selectedExerciseType) return 0;
    const duration = form.getFieldValue('duration_minutes') || 0;
    return Math.round(selectedExerciseType.calories_per_minute * duration);
  };

  const totalCaloriesBurned = todayExercises.reduce(
    (sum, ex) => sum + ex.calories_burned,
    0
  );

  if (loading && todayExercises.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-1">运动记录</h1>
          <p className="text-gray-500">记录您的每日运动，追踪热量消耗</p>
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
            onClick={handleAddExercise}
            className="bg-primary-500 hover:bg-primary-600 border-none h-10 px-4"
          >
            添加记录
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日消耗</p>
              <p className="text-2xl font-bold text-orange-600">{totalCaloriesBurned} kcal</p>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Dumbbell size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">运动次数</p>
              <p className="text-2xl font-bold text-blue-600">{todayExercises.length} 次</p>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">总时长</p>
              <p className="text-2xl font-bold text-green-600">
                {todayExercises.reduce((sum, ex) => sum + ex.duration_minutes, 0)} 分钟
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        {todayExercises.length > 0 ? (
          <List
            dataSource={todayExercises}
            renderItem={(exercise) => (
              <List.Item
                className="px-0 py-4 border-b border-gray-50 last:border-0"
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<Edit2 size={16} />}
                    onClick={() => handleEditExercise(exercise)}
                    className="text-blue-500 hover:text-blue-600"
                  />,
                  <Popconfirm
                    key="delete"
                    title="确定要删除这条记录吗？"
                    onConfirm={() => handleDeleteExercise(exercise.id)}
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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Dumbbell size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-lg">{exercise.exercise_type}</p>
                      <p className="text-sm text-gray-500">
                        时长: {exercise.duration_minutes} 分钟
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-600">- {exercise.calories_burned} kcal</p>
                    <p className="text-xs text-gray-400">
                      {exercise.created_at ? dayjs(exercise.created_at).format('HH:mm') : ''}
                    </p>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="今日暂无运动记录" />
        )}
      </Card>

      <Modal
        title={editingExercise ? '编辑运动记录' : '添加运动记录'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText={editingExercise ? '更新' : '添加'}
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            name="exercise_type"
            label="运动类型"
            rules={[{ required: true, message: '请选择运动类型' }]}
          >
            <Select
              size="large"
              placeholder="选择运动类型"
              onChange={handleSelectExerciseType}
              showSearch
              optionFilterProp="children"
            >
              {exerciseTypes.map((type) => (
                <Option key={type.id} value={type.name}>
                  <div className="flex justify-between items-center">
                    <span>{type.name}</span>
                    <span className="text-gray-400 text-sm">
                      {type.calories_per_minute} kcal/分钟
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="duration_minutes"
            label="运动时长 (分钟)"
            rules={[
              { required: true, message: '请输入运动时长' },
              { type: 'number', min: 1, message: '时长必须大于0' },
            ]}
          >
            <InputNumber
              min={1}
              max={1440}
              placeholder="请输入运动时长"
              className="w-full h-10"
              addonAfter="分钟"
              onChange={() => form.setFieldsValue({ ...form.getFieldsValue() })}
            />
          </Form.Item>

          {selectedExerciseType && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" />
                  <span className="text-sm text-gray-600 font-medium">预计消耗</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {calculateCaloriesBurned()} kcal
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {selectedExerciseType.name} · {selectedExerciseType.calories_per_minute} kcal/分钟 ×{' '}
                {form.getFieldValue('duration_minutes') || 0} 分钟
              </p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Exercises;
