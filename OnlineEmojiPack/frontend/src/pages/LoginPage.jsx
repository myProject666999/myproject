import React from 'react'
import { Form, Input, Button, Card, message, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useUserStore } from '../store/userStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setToken, setUser } = useUserStore()
  const [loading, setLoading] = React.useState(false)

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      setToken(res.data.token)
      setUser(res.data.user)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
      background: '#f5f5f5'
    }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>登录</h2>
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="username"
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
          <div style={{ textAlign: 'center' }}>
            <span>还没有账号？</span>
            <Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
