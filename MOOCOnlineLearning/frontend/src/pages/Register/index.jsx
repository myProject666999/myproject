import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Radio } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../api/user'

const { Title, Text } = Typography

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await register(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (err) {
      message.error(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>用户注册</Title>
          <Text type="secondary">加入慕课MOOC学习平台</Text>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input placeholder="昵称" />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: '请选择角色' }]} initialValue="student">
            <Radio.Group>
              <Radio value="student">学员</Radio>
              <Radio value="teacher">教师</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>注册</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">已有账号？</Text>
            <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
