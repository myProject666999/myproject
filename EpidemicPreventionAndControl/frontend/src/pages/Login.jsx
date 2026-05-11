import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await request.post('/login', values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      message.success('登录成功');
      if (values.role === 'volunteer') {
        navigate('/public');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: '#1890ff' }}>疫情防控管理系统</h1>
          <p style={{ color: '#999', marginTop: 8 }}>请登录您的账户</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ role: 'admin' }}
        >
          <Form.Item name="role">
            <Radio.Group>
              <Radio value="admin">管理员</Radio>
              <Radio value="volunteer">志愿者</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="login_name"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            <p>管理员: admin / admin123</p>
            <p>志愿者: volunteer1 / 123456</p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
