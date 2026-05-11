import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../utils/api'
import { useUserStore } from '../../store/useStore'

const { Title, Text } = Typography

function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useUserStore()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await authApi.adminLogin(values)
      setUser(res.data.user, res.data.token)
      localStorage.setItem('token', res.data.token)
      message.success('登录成功')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>后台管理系统</Title>
          <Text type="secondary">校园闲置物品交易平台</Text>
        </div>
        
        <Form
          name="admin-login"
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
              placeholder="管理员账号" 
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
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default AdminLogin
