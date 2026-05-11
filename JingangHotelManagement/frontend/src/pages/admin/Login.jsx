import { Card, Form, Input, Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../../services/api'

const AdminLogin = () => {
  const navigate = useNavigate()

  const onFinish = async values => {
    try {
      const res = await API.adminLogin(values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('admin', JSON.stringify(res.data.admin))
      message.success('登录成功')
      navigate('/admin/home')
    } catch (e) {}
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card title="金港宾馆 - 管理员登录" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>登录</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/user/login">用户登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default AdminLogin
