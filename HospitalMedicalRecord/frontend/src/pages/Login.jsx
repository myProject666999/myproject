import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import request from '../utils/request'
import { setToken, setUserInfo } from '../utils/auth'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await request.post('/login', values)
      const { token, user_id, username, role, real_name } = res.data
      
      setToken(token)
      setUserInfo({
        userId: user_id,
        username,
        role,
        realName: real_name,
      })
      
      message.success('登录成功')
      
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">医院病历管理系统</h2>
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
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
          <p>默认账户：admin / admin123</p>
          <p>测试账户：doctor01 / admin123</p>
          <p>测试账户：nurse01 / admin123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
