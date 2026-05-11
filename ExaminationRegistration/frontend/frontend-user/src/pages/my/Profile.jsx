import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Typography, Avatar, Row, Col, DatePicker, Select } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getCurrentUser, updateProfile, updatePassword } from '../../utils/api'
import dayjs from 'dayjs'

const { Title } = Typography

const Profile = () => {
  const [user, setUser] = useState(null)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getCurrentUser()
      setUser(res.data)
      form.setFieldsValue({
        ...res.data,
        birthday: res.data.birthday ? dayjs(res.data.birthday) : undefined
      })
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const onFinish = async (values) => {
    try {
      if (values.birthday) {
        values.birthday = values.birthday.format('YYYY-MM-DD')
      }
      await updateProfile(values)
      message.success('更新成功')
      loadData()
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  const onPasswordFinish = async (values) => {
    try {
      await updatePassword(values)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      console.error('Update password error:', error)
    }
  }

  if (!user) return null

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>个人信息</Title>
      
      <Card title="基本信息" style={{ marginBottom: 24 }}>
        <Row gutter={32}>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Avatar size={120} icon={<UserOutlined />} src={user.avatar} />
            <p style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>
              {user.nickname || user.username}
            </p>
            <p style={{ color: '#999' }}>ID: {user.id}</p>
          </Col>
          <Col span={18}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="用户名"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="nickname"
                    label="昵称"
                  >
                    <Input placeholder="请输入昵称" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                  >
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                  >
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label="性别"
                  >
                    <Select
                      options={[
                        { value: 1, label: '男' },
                        { value: 2, label: '女' }
                      ]}
                      placeholder="请选择性别"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="birthday"
                    label="生日"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="address"
                label="地址"
              >
                <Input placeholder="请输入地址" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">保存修改</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      <Card title="修改密码">
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onPasswordFinish}
          style={{ maxWidth: 400 }}
        >
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
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">修改密码</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Profile
