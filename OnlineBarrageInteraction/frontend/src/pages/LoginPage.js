import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await userApi.login(values);
      const { user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);

      message.success('登录成功');
      navigate('/send');
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 20,
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}
        title={
          <div style={{ textAlign: 'center' }}>
            <UserOutlined style={{ fontSize: 48, color: '#667eea' }} />
            <h2 style={{ marginTop: 16 }}>用户登录</h2>
          </div>
        }
      >
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入您的昵称' }]}
          >
            <Input placeholder="请输入您的昵称" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<ArrowRightOutlined />}
            >
              进入弹幕互动
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" onClick={() => navigate('/admin/login')}>
            管理员登录
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
