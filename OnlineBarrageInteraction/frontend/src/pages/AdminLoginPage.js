import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await userApi.adminLogin(values);
      const { admin } = response.data;

      localStorage.setItem('adminId', admin.id);
      localStorage.setItem('admin', JSON.stringify(admin));

      message.success('登录成功');
      navigate('/admin');
    } catch (error) {
      message.error('用户名或密码错误');
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: 20,
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
        title={
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 48, color: '#16213e' }} />
            <h2 style={{ marginTop: 16 }}>管理员登录</h2>
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
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录管理后台
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          默认账号: admin / admin123
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" onClick={() => navigate('/login')}>
            返回用户登录
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
