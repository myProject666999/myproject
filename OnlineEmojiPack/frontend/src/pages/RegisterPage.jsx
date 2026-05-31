import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      await authApi.register(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error) {
      message.error(error.message || '注册失败')
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
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>注册</h2>
        <Form onFinish={handleRegister} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 50, message: '用户名长度在3-50之间' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 100, message: '密码长度在6-100之间' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="昵称" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱（可选）" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <span>已有账号？</span>
            <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage
