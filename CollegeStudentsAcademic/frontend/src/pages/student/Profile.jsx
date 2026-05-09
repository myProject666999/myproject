import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Select, Tabs } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { studentApi } from '../../utils/api'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await studentApi.getProfile()
      setProfile(data)
      form.setFieldsValue(data)
    } catch (error) {
      message.error('加载失败')
    }
  }

  const handleUpdateProfile = async (values) => {
    try {
      await studentApi.updateProfile(values)
      message.success('保存成功')
      loadProfile()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleChangePassword = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次密码不一致')
      return
    }
    try {
      await studentApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password
      })
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      message.error(error.message || '修改失败')
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          style={{ maxWidth: 500 }}
        >
          <Form.Item name="student_no" label="学号">
            <Input disabled />
          </Form.Item>
          <Form.Item name="real_name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select>
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="birthday" label="生日">
            <Input placeholder="如: 2000-01-01" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="college" label="学院">
            <Input />
          </Form.Item>
          <Form.Item name="major" label="专业">
            <Input />
          </Form.Item>
          <Form.Item name="class" label="班级">
            <Input />
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select>
              <Select.Option value="大一">大一</Select.Option>
              <Select.Option value="大二">大二</Select.Option>
              <Select.Option value="大三">大三</Select.Option>
              <Select.Option value="大四">大四</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存</Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'password',
      label: '修改密码',
      icon: <LockOutlined />,
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ maxWidth: 400 }}
        >
          <Form.Item name="old_password" label="原密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirm_password" label="确认新密码" rules={[{ required: true }]}>
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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ marginBottom: 24 }}>个人中心</h2>
      <Card>
        <Tabs items={tabItems} defaultActiveKey="profile" />
      </Card>
    </div>
  )
}

export default Profile
