import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, ShareAltOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'

const { Title, Text } = Typography

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  nickname?: string
}

export default function Register() {
  const navigate = useNavigate()
  const { register, loading } = useUserStore()
  const [form] = Form.useForm<RegisterForm>()

  const handleSubmit = async (values: RegisterForm) => {
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        nickname: values.nickname,
      })
      message.success('注册成功，请登录')
      navigate('/login')
    } catch {
      message.error('注册失败，请稍后重试')
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
            创建账号
          </Title>
          <Text type="secondary">加入协同文档，开始高效协作</Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="nickname"
          >
            <Input placeholder="昵称（选填）" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">已有账号？</Text>
            <Link to="/login" style={{ marginLeft: 8 }}>
              立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
