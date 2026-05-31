import React, { useState } from 'react'
import { Form, Input, Button, Tabs, message, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useUserStore } from '../store'

export default function Login({ isRegister }) {
  const navigate = useNavigate()
  const { setUser, setToken } = useUserStore()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      setUser(res.data)
      setToken(res.data.token)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      const res = await authApi.register(values)
      setUser(res.data)
      setToken(res.data.token)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      message.success('注册成功')
      navigate('/')
    } catch (error) {
      message.error(error.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <h2 className="login-title">
          {isRegister ? '注册账号' : '欢迎登录'}
        </h2>
        <Tabs
          activeKey={isRegister ? 'register' : 'login'}
          onChange={(key) => navigate(key === 'register' ? '/register' : '/login')}
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={handleLogin} layout="vertical">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={handleRegister} layout="vertical">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item name="realName" rules={[{ required: true, message: '请输入真实姓名' }]}>
                    <Input placeholder="真实姓名" size="large" />
                  </Form.Item>
                  <Form.Item name="email">
                    <Input placeholder="邮箱(可选)" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
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
  )
}
