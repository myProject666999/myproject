import { Card, Form, Input, Button, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { studentApi } from '../../utils/api'

function StudentLogin() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      const result = await studentApi.login(values)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      message.success('登录成功')
      navigate('/home')
    } catch (error) {
      message.error(error.message || '登录失败')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2>学生登录</h2>
          <p style={{ color: '#666' }}>学业规划咨询服务平台</p>
        </div>
        <Form
          form={form}
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            name="student_no"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="学号" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          还没有账号？
          <Link to="/register">立即注册</Link>
          <span style={{ margin: '0 8px' }}>|</span>
          <Link to="/admin/login">管理员登录</Link>
        </div>
      </Card>
    </div>
  )
}

export default StudentLogin
