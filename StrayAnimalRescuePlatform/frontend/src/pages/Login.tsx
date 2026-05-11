import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Col xs={22} sm={16} md={12} lg={8}>
        <Card style={{ borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>🐾 流浪动物救助平台</h1>
            <p style={{ color: '#888' }}>欢迎回来，请登录您的账号</p>
          </div>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
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

            <div style={{ textAlign: 'center' }}>
              还没有账号？<Link to="/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

export default Login
