import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Radio,
  Tabs,
  message,
  Row,
  Col,
  Statistic,
  Descriptions,
  Spin,
} from 'antd';
import { User as UserIcon, Target, Activity, Scale, TrendingUp, Save } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import type {
  UpdateProfileRequest,
  UpdateGoalRequest,
  User,
  UserGoal,
  Gender,
  ActivityLevel,
  GoalType,
} from '../../types';

const { Option } = Select;
const { TabPane } = Tabs;

const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: '久坐不动（几乎不运动）',
  light: '轻度活动（每周1-3次运动）',
  moderate: '中度活动（每周3-5次运动）',
  active: '高度活动（每周6-7次运动）',
  very_active: '极高活动（专业运动员）',
};

const goalTypeLabels: Record<GoalType, string> = {
  lose_weight: '减脂',
  maintain: '维持体重',
  gain_weight: '增肌',
};

const genderLabels: Record<Gender, string> = {
  male: '男',
  female: '女',
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [profileForm] = Form.useForm();
  const [goalForm] = Form.useForm();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const {
    user,
    goal,
    updateProfile,
    updateGoal,
  } = useAuthStore();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        gender: user.gender,
        age: user.age,
        height: user.height,
        weight: user.weight,
        activity_level: user.activity_level,
      });
    }
    if (goal) {
      goalForm.setFieldsValue({
        daily_calorie_goal: goal.daily_calorie_goal,
        target_weight: goal.target_weight,
        goal_type: goal.goal_type,
        activity_level: user?.activity_level,
      });
    }
  }, [user, goal, profileForm, goalForm]);

  const calculateBMR = (userData: Partial<User>): number => {
    if (!userData.weight || !userData.height || !userData.age || !userData.gender) {
      return 0;
    }
    if (userData.gender === 'male') {
      return Math.round(
        10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5
      );
    } else {
      return Math.round(
        10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161
      );
    }
  };

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const calculateTDEE = (bmr: number, activityLevel?: ActivityLevel): number => {
    if (!bmr || !activityLevel) return 0;
    return Math.round(bmr * activityMultipliers[activityLevel]);
  };

  const getCurrentBMR = () => {
    if (!user) return 0;
    return calculateBMR(user);
  };

  const getCurrentTDEE = () => {
    const bmr = getCurrentBMR();
    return calculateTDEE(bmr, user?.activity_level);
  };

  const handleProfileSubmit = async (values: any) => {
    setSavingProfile(true);
    try {
      const updateData: UpdateProfileRequest = {
        email: values.email,
        gender: values.gender,
        age: values.age,
        height: values.height,
        weight: values.weight,
        activity_level: values.activity_level,
      };
      await updateProfile(updateData);
      message.success('个人信息更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGoalSubmit = async (values: any) => {
    setSavingGoal(true);
    try {
      const updateData: UpdateGoalRequest = {
        daily_calorie_goal: values.daily_calorie_goal,
        target_weight: values.target_weight,
        goal_type: values.goal_type,
        activity_level: values.activity_level,
      };
      await updateGoal(updateData);
      message.success('目标设置更新成功');
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setSavingGoal(false);
    }
  };

  const calculateSuggestedCalories = () => {
    const values = goalForm.getFieldsValue();
    const activityLevel = values.activity_level || user?.activity_level;
    
    const currentBMR = calculateBMR({
      weight: user?.weight,
      height: user?.height,
      age: user?.age,
      gender: user?.gender,
    });
    const tdee = calculateTDEE(currentBMR, activityLevel);
    
    if (!values.goal_type) return tdee;
    
    switch (values.goal_type) {
      case 'lose_weight':
        return tdee - 500;
      case 'gain_weight':
        return tdee + 300;
      default:
        return tdee;
    }
  };

  if (!user || !goal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">个人中心</h1>
        <p className="text-gray-500">管理您的个人信息和健康目标</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{user.username}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <Statistic
                  title="身高"
                  value={user.height}
                  suffix="cm"
                  valueStyle={{ fontSize: '18px', color: '#10B981' }}
                />
                <Statistic
                  title="体重"
                  value={user.weight}
                  suffix="kg"
                  valueStyle={{ fontSize: '18px', color: '#3B82F6' }}
                />
                <Statistic
                  title="年龄"
                  value={user.age}
                  suffix="岁"
                  valueStyle={{ fontSize: '18px', color: '#F59E0B' }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-primary-500" />
              <h3 className="font-semibold text-gray-800">代谢数据</h3>
            </div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="BMR (基础代谢率)">
                <span className="font-bold text-primary-600 text-lg">{getCurrentBMR()}</span>
                <span className="text-gray-400 ml-1">kcal/天</span>
              </Descriptions.Item>
              <Descriptions.Item label="TDEE (总能量消耗)">
                <span className="font-bold text-blue-600 text-lg">{getCurrentTDEE()}</span>
                <span className="text-gray-400 ml-1">kcal/天</span>
              </Descriptions.Item>
              <Descriptions.Item label="活动水平">
                {activityLevelLabels[user.activity_level]}
              </Descriptions.Item>
              <Descriptions.Item label="每日热量目标">
                <span className="font-bold text-orange-600 text-lg">{goal.daily_calorie_goal}</span>
                <span className="text-gray-400 ml-1">kcal</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-orange-500" />
              <h3 className="font-semibold text-gray-800">当前目标</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-orange-500" />
                  </div>
                  <span className="text-gray-600">目标类型</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {goalTypeLabels[goal.goal_type]}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Scale size={20} className="text-blue-500" />
                  </div>
                  <span className="text-gray-600">目标体重</span>
                </div>
                <span className="font-semibold text-blue-600">{goal.target_weight} kg</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-500" />
                  </div>
                  <span className="text-gray-600">当前体重</span>
                </div>
                <span className="font-semibold text-green-600">{user.weight} kg</span>
              </div>
              {user.weight !== goal.target_weight && (
                <div className="text-center text-sm text-gray-500">
                  距离目标体重还有{' '}
                  <span className="font-bold text-primary-600">
                    {Math.abs(user.weight - goal.target_weight).toFixed(1)} kg
                  </span>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: (
                <span className="flex items-center gap-2">
                  <UserIcon size={18} />
                  基本信息
                </span>
              ),
              children: (
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileSubmit}
                  size="large"
                  className="max-w-2xl"
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="username"
                        label="用户名"
                        rules={[
                          { required: true, message: '请输入用户名' },
                          { min: 2, message: '用户名至少2个字符' },
                        ]}
                      >
                        <Input placeholder="请输入用户名" className="h-10" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' },
                        ]}
                      >
                        <Input placeholder="请输入邮箱" className="h-10" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="gender"
                    label="性别"
                    rules={[{ required: true, message: '请选择性别' }]}
                  >
                    <Radio.Group className="w-full">
                      <Radio.Button value="male" className="flex-1 text-center">
                        男
                      </Radio.Button>
                      <Radio.Button value="female" className="flex-1 text-center">
                        女
                      </Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="age"
                        label="年龄"
                        rules={[
                          { required: true, message: '请输入年龄' },
                          { type: 'number', min: 1, max: 120, message: '请输入有效的年龄' },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={120}
                          placeholder="岁"
                          className="w-full h-10"
                          addonAfter="岁"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="height"
                        label="身高"
                        rules={[
                          { required: true, message: '请输入身高' },
                          { type: 'number', min: 50, max: 250, message: '请输入有效的身高' },
                        ]}
                      >
                        <InputNumber
                          min={50}
                          max={250}
                          placeholder="cm"
                          className="w-full h-10"
                          addonAfter="cm"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="weight"
                        label="体重"
                        rules={[
                          { required: true, message: '请输入体重' },
                          { type: 'number', min: 20, max: 300, message: '请输入有效的体重' },
                        ]}
                      >
                        <InputNumber
                          min={20}
                          max={300}
                          placeholder="kg"
                          className="w-full h-10"
                          addonAfter="kg"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="activity_level"
                    label="活动水平"
                    rules={[{ required: true, message: '请选择活动水平' }]}
                  >
                    <Select size="large" placeholder="选择活动水平">
                      {Object.entries(activityLevelLabels).map(([value, label]) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={savingProfile}
                      icon={<Save size={18} />}
                      className="bg-primary-500 hover:bg-primary-600 border-none h-10 px-6"
                    >
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'goal',
              label: (
                <span className="flex items-center gap-2">
                  <Target size={18} />
                  目标设置
                </span>
              ),
              children: (
                <Form
                  form={goalForm}
                  layout="vertical"
                  onFinish={handleGoalSubmit}
                  size="large"
                  className="max-w-2xl"
                >
                  <Form.Item
                    name="goal_type"
                    label="目标类型"
                    rules={[{ required: true, message: '请选择目标类型' }]}
                  >
                    <Radio.Group
                      className="w-full"
                      onChange={() => {
                        const suggested = calculateSuggestedCalories();
                        goalForm.setFieldsValue({ daily_calorie_goal: suggested });
                      }}
                    >
                      {Object.entries(goalTypeLabels).map(([value, label]) => (
                        <Radio.Button key={value} value={value} className="flex-1 text-center">
                          {label}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="target_weight"
                        label="目标体重"
                        rules={[
                          { required: true, message: '请输入目标体重' },
                          { type: 'number', min: 20, max: 300, message: '请输入有效的体重' },
                        ]}
                      >
                        <InputNumber
                          min={20}
                          max={300}
                          placeholder="kg"
                          className="w-full h-10"
                          addonAfter="kg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="daily_calorie_goal"
                        label="每日热量目标"
                        rules={[
                          { required: true, message: '请输入每日热量目标' },
                          { type: 'number', min: 500, max: 8000, message: '请输入有效的热量值' },
                        ]}
                        help={
                          <span className="text-gray-500">
                            根据您的目标，建议摄入约{' '}
                            <span className="text-primary-600 font-medium">
                              {calculateSuggestedCalories()}
                            </span>{' '}
                            kcal/天
                          </span>
                        }
                      >
                        <InputNumber
                          min={500}
                          max={8000}
                          placeholder="kcal"
                          className="w-full h-10"
                          addonAfter="kcal"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="activity_level"
                    label="活动水平 (用于计算建议热量)"
                    rules={[{ required: true, message: '请选择活动水平' }]}
                  >
                    <Select
                      size="large"
                      placeholder="选择活动水平"
                      onChange={() => {
                        const suggested = calculateSuggestedCalories();
                        goalForm.setFieldsValue({ daily_calorie_goal: suggested });
                      }}
                    >
                      {Object.entries(activityLevelLabels).map(([value, label]) => (
                        <Option key={value} value={value}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={savingGoal}
                      icon={<Save size={18} />}
                      className="bg-primary-500 hover:bg-primary-600 border-none h-10 px-6"
                    >
                      保存目标
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Profile;
