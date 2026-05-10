import { Card, Form, Input, Button, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import WebLayout from '../components/Layout'

const { Title } = Typography

function Register() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { register } = useAuth()

  const onFinish = async (values) => {
    try {
      await register(values)
      message.success('注册成功')
      navigate('/')
    } catch (err) {
      // Error handled by api interceptor
    }
  }

  return (
    <WebLayout>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
        <Card style={{ width: 450 }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>注册</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
            </Form.Item>
            <Form.Item
              name="nickname"
            >
              <Input prefix={<UserOutlined />} placeholder="昵称" size="large" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ type: 'email', message: '请输入有效邮箱' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" />
            </Form.Item>
            <Form.Item
              name="phone"
            >
              <Input prefix={<PhoneOutlined />} placeholder="手机号" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">注册</Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              已有账号？ <Link to="/login">立即登录</Link>
            </div>
          </Form>
        </Card>
      </div>
    </WebLayout>
  )
}

export default Register
