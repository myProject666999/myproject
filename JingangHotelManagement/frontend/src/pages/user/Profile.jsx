import { Card, Form, Input, Button, Tabs, message } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const Profile = () => {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await API.getProfile()
      form.setFieldsValue(res.data)
    } catch (e) {}
  }

  const onFinish = async values => {
    try {
      await API.updateProfile(values)
      message.success('更新成功')
      loadProfile()
    } catch (e) {}
  }

  const onPasswordFinish = async values => {
    try {
      await API.changePassword(values)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (e) {}
  }

  const items = [
    {
      key: '1',
      label: '基本信息',
      children: (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="realName" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存</Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '2',
      label: '修改密码',
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={onPasswordFinish}>
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">修改密码</Button>
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div>
      <h2>个人信息</h2>
      <Card>
        <Tabs items={items} />
      </Card>
    </div>
  )
}

export default Profile
