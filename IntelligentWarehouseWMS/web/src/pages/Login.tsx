import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const res = await authApi.login(values)
      const result = res as any
      localStorage.setItem('token', result.data?.token || result.token)
      localStorage.setItem('userInfo', JSON.stringify(result.data || result))
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error) {
      message.error('登录失败')
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>智能仓储WMS管理系统</h1>
          <p style={{ color: '#999' }}>数字化管理，提升效率</p>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          initialValues={{ username: 'admin', password: 'admin123' }}
        >
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
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
