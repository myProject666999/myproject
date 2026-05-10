import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../utils/api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await authApi.register(values);
      message.success('注册成功，请登录');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
            社区养老医疗综合服务平台
          </h1>
        </div>
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form
                  name="login"
                  onFinish={handleLogin}
                  autoComplete="off"
                  layout="vertical"
                >
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                      登录
                    </Button>
                  </Form.Item>

                  <div style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>
                    <p>默认账号：</p>
                    <p>管理员：admin / admin123</p>
                    <p>医生：doctor / doctor123</p>
                    <p>患者：patient / patient123</p>
                  </div>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form
                  name="register"
                  onFinish={handleRegister}
                  autoComplete="off"
                  layout="vertical"
                >
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="real_name"
                    label="真实姓名"
                  >
                    <Input placeholder="请输入真实姓名" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="手机号"
                  >
                    <Input placeholder="请输入手机号" size="large" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
