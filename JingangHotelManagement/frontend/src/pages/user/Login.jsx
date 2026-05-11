import { Card, Form, Input, Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../../services/api'

const UserLogin = () => {
  const navigate = useNavigate()

  const onFinish = async values => {
    try {
      const res = await API.login(values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      message.success('登录成功')
      navigate('/user/home')
    } catch (e) {}
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card title="金港宾馆 - 用户登录" style={{ width: 400 }}>
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
            还没有账号？<Link to="/user/register">立即注册</Link>
            <br />
            管理员登录？<Link to="/admin/login">点击这里</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default UserLogin
