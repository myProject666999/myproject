import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { changeAdminPassword, changeUserPassword } from '../utils/api'

const ChangePassword = ({ role }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  const onFinish = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const api = role === 'admin' ? changeAdminPassword : changeUserPassword
      await api({
        old_password: values.old_password,
        new_password: values.new_password
      })
      message.success('密码修改成功，请重新登录')
      form.resetFields()
    } catch (error) {
      console.error('Change password error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="修改密码" style={{ maxWidth: 500 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="old_password"
          label="原密码"
          rules={[{ required: true, message: '请输入原密码' }]}
        >
          <Input.Password placeholder="请输入原密码" />
        </Form.Item>
        <Form.Item
          name="new_password"
          label="新密码"
          rules={[{ required: true, message: '请输入新密码', min: 6 }]}
        >
          <Input.Password placeholder="请输入新密码（至少6位）" />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="确认新密码"
          rules={[{ required: true, message: '请确认新密码' }]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ChangePassword
