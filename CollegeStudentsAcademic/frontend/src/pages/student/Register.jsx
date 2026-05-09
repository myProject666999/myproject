import { Card, Form, Input, Button, message, Select } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { studentApi } from '../../utils/api'

function StudentRegister() {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      await studentApi.register(values)
      message.success('注册成功，请等待管理员审核')
      navigate('/login')
    } catch (error) {
      message.error(error.message || '注册失败')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2>学生注册</h2>
          <p style={{ color: '#666' }}>学业规划咨询服务平台</p>
        </div>
        <Form
          form={form}
          onFinish={handleSubmit}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="student_no"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入学号" />
          </Form.Item>
          <Form.Item
            name="real_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item name="college" label="学院">
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item name="major" label="专业">
            <Input placeholder="请输入专业" />
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select placeholder="请选择年级">
              <Select.Option value="大一">大一</Select.Option>
              <Select.Option value="大二">大二</Select.Option>
              <Select.Option value="大三">大三</Select.Option>
              <Select.Option value="大四">大四</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  )
}

export default StudentRegister
