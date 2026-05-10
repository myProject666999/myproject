import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, CellGroup, showToast, NavBar, Form } from 'vant'
import { authApi } from '../api'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleRegister = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const res = await authApi.register(values)
      localStorage.setItem('user_token', res.data.token)
      localStorage.setItem('user_info', JSON.stringify(res.data.user))
      showToast('注册成功')
      navigate('/home')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <NavBar title="注册" leftText="返回" onClickLeft={() => navigate(-1)} />
      <div style={{ padding: 20, marginTop: 20 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>新用户注册</h2>
        <Form form={form} onFinish={handleRegister}>
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
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            />
            <Field
              name="nickname"
              label="昵称"
              placeholder="请输入昵称"
            />
            <Field
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
            />
            <Field
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
            />
          </CellGroup>
          <div style={{ marginTop: 20 }}>
            <Button type="primary" round block loading={loading} nativeType="submit">
              注册
            </Button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="text" onClick={() => navigate('/login')}>
              已有账号？去登录
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage
