import React from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import request from '../utils/request'

const ChangePassword = () => {
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      await request.put('/change-password', {
        old_password: values.oldPassword,
        new_password: values.newPassword,
      })
      message.success('密码修改成功，请重新登录')
      form.resetFields()
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    } catch (error) {
      console.error('Change password error:', error)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">修改密码</h2>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ChangePassword
