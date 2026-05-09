import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await authAPI.login(values);
      if (res.data.code === 200) {
        const { token, user, student, admin } = res.data.data;
        localStorage.setItem('token', token);
        const userData = { ...user, student, admin };
        localStorage.setItem('user', JSON.stringify(userData));
        
        message.success('登录成功');
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败');
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
      <Card style={{ width: 400 }} title="校园垃圾分类管理系统">
        <Radio.Group value={role} onChange={(e) => setRole(e.target.value)} style={{ marginBottom: 16, width: '100%' }}>
          <Radio.Button value="student" style={{ width: '50%', textAlign: 'center' }}>学生登录</Radio.Button>
          <Radio.Button value="admin" style={{ width: '50%', textAlign: 'center' }}>管理员登录</Radio.Button>
        </Radio.Group>
        
        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ role: 'student' }}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          {role === 'student' && (
            <div style={{ textAlign: 'center' }}>
              还没有账号？<a href="#" onClick={() => navigate('/register')}>立即注册</a>
            </div>
          )}
          {role === 'admin' && (
            <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
              管理员默认账号：admin / admin123
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
}

export default Login;
