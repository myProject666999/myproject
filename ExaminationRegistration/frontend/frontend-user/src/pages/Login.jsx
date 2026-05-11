import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/api'

const Login = () => {
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      const res = await login(values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      message.success('登录成功')
      
      if (res.data.is_admin) {
        window.location.href = 'http://localhost:3001'
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户登录</h2>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <span style={{ marginRight: 16 }}>测试账号: testuser / password123</span>
            <br />
            <span>管理员账号: admin / password123</span>
            <br />
            <span>没有账号? <a onClick={() => navigate('/register')} style={{ color: '#1890ff', cursor: 'pointer' }}>立即注册</a></span>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
