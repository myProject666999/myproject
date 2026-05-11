import { Card, Form, Input, Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../../services/api'

const UserRegister = () => {
  const navigate = useNavigate()

  const onFinish = async values => {
    try {
      await API.register(values)
      message.success('注册成功')
      navigate('/user/login')
    } catch (e) {}
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card title="金港宾馆 - 用户注册" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>注册</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/user/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default UserRegister
