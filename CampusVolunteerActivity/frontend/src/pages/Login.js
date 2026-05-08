import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const user = await login(values);
      message.success('登录成功');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      await register(values);
      message.success('注册成功，请登录');
      window.location.reload();
    } catch (error) {
      console.error('Register failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <Form
      name="login"
      layout="vertical"
      onFinish={handleLogin}
      autoComplete="off"
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名!' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码!' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form
      name="register"
      layout="vertical"
      onFinish={handleRegister}
      autoComplete="off"
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名!' },
          { min: 3, message: '用户名至少3个字符' }
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码!' },
          { min: 6, message: '密码至少6个字符' }
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
      </Form.Item>

      <Form.Item
        name="real_name"
        label="真实姓名"
        rules={[{ required: true, message: '请输入真实姓名!' }]}
      >
        <Input placeholder="请输入真实姓名" size="large" />
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
      >
        <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
      >
        <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
      </Form.Item>

      <Form.Item
        name="role"
        label="角色"
        initialValue="volunteer"
      >
        <Radio.Group>
          <Radio value="volunteer">志愿者</Radio>
          <Radio value="admin">管理员</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  const items = [
    { key: '1', label: '登录', children: loginForm },
    { key: '2', label: '注册', children: registerForm },
  ];

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-logo">
          <h1>校园志愿者活动管理系统</h1>
        </div>
        <Tabs items={items} defaultActiveKey="1" />
      </Card>
    </div>
  );
};

export default Login;
