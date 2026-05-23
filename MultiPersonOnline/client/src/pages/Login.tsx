import { Form, Input, Button, Card, Checkbox, message, Typography, Divider } from 'antd'
import { UserOutlined, LockOutlined, ShareAltOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { storage } from '@/utils/storage'

const { Title, Text } = Typography

interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

export default function Login() {
  const navigate = useNavigate()
  const { login, loading } = useUserStore()
  const [form] = Form.useForm<LoginForm>()

  const handleSubmit = async (values: LoginForm) => {
    try {
      await login({
        username: values.username,
        password: values.password,
      })
      if (values.remember) {
        storage.set('remember_login', 'true')
      }
      message.success('登录成功')
      navigate('/dashboard')
    } catch {
      message.error('登录失败，请检查用户名和密码')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
        bodyStyle={{ padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ShareAltOutlined
            style={{
              fontSize: 48,
              color: '#1677ff',
              marginBottom: 16,
            }}
          />
          <Title level={3} style={{ marginBottom: 8 }}>
            协同文档
          </Title>
          <Text type="secondary">多人实时协作，高效办公</Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Link to="/forgot-password">忘记密码？</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <Divider plain>
            <Text type="secondary">还没有账号？</Text>
          </Divider>

          <Link to="/register">
            <Button block>立即注册</Button>
          </Link>
        </Form>
      </Card>
    </div>
  )
}
