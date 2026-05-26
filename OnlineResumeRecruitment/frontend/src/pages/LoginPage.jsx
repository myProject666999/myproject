import React, { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Tabs,
  Radio,
  Card,
  Row,
  Col,
  Typography,
  message
} from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../utils/request.js'

const { Title, Text } = Typography

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const data = await request.post('/auth/login', values)
      if (data?.token) {
        localStorage.setItem('token', data.token)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        message.success('登录成功')
        navigate('/home')
      }
    } catch (err) {
      // error handled in interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      await request.post('/auth/register', values)
      message.success('注册成功，请登录')
      setActiveTab('login')
    } catch (err) {
      // error handled in interceptor
    } finally {
      setLoading(false)
    }
  }

  const loginForm = (
    <Form
      name="login"
      layout="vertical"
      onFinish={handleLogin}
      autoComplete="off"
      requiredMark={false}
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请输入密码"
          size="large"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          登录
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form
      name="register"
      layout="vertical"
      onFinish={handleRegister}
      autoComplete="off"
      requiredMark={false}
      initialValues={{ role: 'JOB_SEEKER' }}
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, max: 20, message: '用户名长度为 3-20 位' }
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="请输入用户名" size="large" />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, max: 20, message: '密码长度为 6-20 位' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请输入密码"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
      </Form.Item>
      <Form.Item
        name="phone"
        label="手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
        ]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
      </Form.Item>
      <Form.Item
        name="role"
        label="角色"
        rules={[{ required: true, message: '请选择角色' }]}
      >
        <Radio.Group size="large">
          <Radio value="JOB_SEEKER">求职者</Radio>
          <Radio value="HR">企业HR</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  const tabItems = [
    { key: 'login', label: '登录', children: loginForm },
    { key: 'register', label: '注册', children: registerForm }
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <Row gutter={[32, 32]} align="middle" style={{ width: '100%', maxWidth: 960 }}>
        <Col xs={0} md={12} style={{ color: '#fff' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
            在线招聘平台
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            连接优质人才与优秀企业，让求职招聘更简单高效
          </Text>
        </Col>
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              size="large"
              items={tabItems}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default LoginPage
