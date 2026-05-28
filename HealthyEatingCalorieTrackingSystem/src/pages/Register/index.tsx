import { useState } from 'react';
import { Form, Input, Button, Card, Select, InputNumber, Radio, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import type { RegisterRequest } from '../../types';

const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const registerData: RegisterRequest = {
        username: values.username,
        password: values.password,
        email: values.email,
        gender: values.gender,
        age: values.age,
        height: values.height,
        weight: values.weight,
      };
      await register(registerData);
      message.success('注册成功');
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="w-full max-w-lg mx-auto animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">创建账户</h1>
          <p className="text-gray-500">填写以下信息，开始您的健康之旅</p>
        </div>

        <Card className="shadow-xl border-0 rounded-2xl">
          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, message: '用户名至少2个字符' },
                ]}
              >
                <Input
                  prefix={<User size={18} className="text-gray-400" />}
                  placeholder="请输入用户名"
                  className="h-12"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  prefix={<Mail size={18} className="text-gray-400" />}
                  placeholder="请输入邮箱"
                  className="h-12"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<Lock size={18} className="text-gray-400" />}
                  placeholder="请输入密码"
                  className="h-12"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<Lock size={18} className="text-gray-400" />}
                  placeholder="请再次输入密码"
                  className="h-12"
                />
              </Form.Item>
            </div>

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

            <div className="grid grid-cols-3 gap-4">
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
                  className="w-full h-12"
                  addonAfter="岁"
                />
              </Form.Item>

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
                  className="w-full h-12"
                  addonAfter="cm"
                />
              </Form.Item>

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
                  className="w-full h-12"
                  addonAfter="kg"
                />
              </Form.Item>
            </div>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12 bg-primary-500 hover:bg-primary-600 border-none font-medium text-base"
              >
                注册
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-500">已有账户？</span>
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium ml-1">
                立即登录
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
