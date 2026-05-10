import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { authApi } from '../api'

const Profile = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await authApi.getCurrentAdmin()
      form.setFieldsValue(res.data)
    } catch (error) {
      message.error('加载用户信息失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      await authApi.updateProfile(values)
      message.success('更新成功')
      const admin = JSON.parse(localStorage.getItem('admin') || '{}')
      localStorage.setItem('admin', JSON.stringify({ ...admin, ...values }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>个人信息</h2>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 500 }}
        >
          <Form.Item name="username" label="用户名">
            <Input disabled />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Profile
