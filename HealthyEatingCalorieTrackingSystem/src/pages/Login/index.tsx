import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import type { LoginRequest } from '../../types';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      await login(values);
      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg">
            <UtensilsCrossed size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">健康饮食追踪</h1>
          <p className="text-gray-500">登录您的账户，开始健康生活</p>
        </div>

        <Card className="shadow-xl border-0 rounded-2xl">
          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
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

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="h-12 bg-primary-500 hover:bg-primary-600 border-none font-medium text-base"
              >
                登录
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-500">还没有账户？</span>
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium ml-1">
                立即注册
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
