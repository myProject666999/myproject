import React, { useState } from 'react'
import { Row, Col, Tag, Card, Form, Input, Button, Avatar, Typography, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text } = Typography

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await updateUser(values)
      message.success('更新成功')
    } catch (error: any) {
      message.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>个人中心</Title>

      <Row gutter={24}>
        <Col span={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar size={100} icon={<UserOutlined />} src={user?.avatar} />
            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
              {user?.nickname || user?.username}
            </Title>
            <Text type="secondary">{user?.email}</Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue">{user?.role === 'admin' ? '管理员' : '普通用户'}</Tag>
            </div>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="个人信息">
            <Form
              form={form}
              layout="vertical"
              initialValues={user}
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="nickname" label="昵称">
                    <Input placeholder="请输入昵称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="username" label="用户名">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="邮箱">
                    <Input placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="手机号">
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
