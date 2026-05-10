import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, CellGroup, showToast, NavBar, Form } from 'vant'
import { authApi } from '../api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleLogin = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const res = await authApi.login(values)
      localStorage.setItem('user_token', res.data.token)
      localStorage.setItem('user_info', JSON.stringify(res.data.user))
      showToast('登录成功')
      navigate('/home')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <NavBar title="登录" leftText="返回" onClickLeft={() => navigate(-1)} />
      <div style={{ padding: 20, marginTop: 40 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 30 }}>城市轨道交通激励</h2>
        <Form form={form} onFinish={handleLogin}>
          <CellGroup inset>
            <Field
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            />
            <Field
              name="password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              rules={[{ required: true, message: '请输入密码' }]}
            />
          </CellGroup>
          <div style={{ marginTop: 20 }}>
            <Button type="primary" round block loading={loading} nativeType="submit">
              登录
            </Button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="text" onClick={() => navigate('/register')}>
              没有账号？去注册
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
