import { Card, Form, Input, Button, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import WebLayout from '../components/Layout'

const { Title } = Typography

function Login() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login } = useAuth()

  const onFinish = async (values) => {
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate('/')
    } catch (err) {
      // Error handled by api interceptor
    }
  }

  return (
    <WebLayout>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
        <Card style={{ width: 400 }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>登录</Title>
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
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">登录</Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              还没有账号？ <Link to="/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </div>
    </WebLayout>
  )
}

export default Login
