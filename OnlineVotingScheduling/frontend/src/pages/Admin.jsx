import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, message, Typography, Tabs, Row, Col, Statistic, Avatar } from 'antd'
import { PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import { userApi, teamApi, scheduleApi, shiftSwapApi } from '../api'
import { useUserStore } from '../store'

const { Title, Text } = Typography

export default function Admin() {
  const { user } = useUserStore()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ userCount: 0, teamCount: 0, scheduleCount: 0, swapCount: 0 })
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, teamsRes, schedulesRes, swapsRes] = await Promise.all([
        userApi.getAll(),
        teamApi.getAll(),
        Promise.resolve({ data: [] }),
        shiftSwapApi.getMySwaps()
      ])
      setUsers(usersRes.data || [])
      setStats({
        userCount: usersRes.data?.length || 0,
        teamCount: teamsRes.data?.length || 0,
        scheduleCount: 0,
        swapCount: (swapsRes.data || []).filter(s => s.status === 'PENDING').length
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleToggleStatus = async (record) => {
    try {
      const newStatus = record.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
      await userApi.changeStatus(record.id, newStatus)
      message.success(`已${newStatus === 'ACTIVE' ? '激活' : '禁用'}用户`)
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      await userApi.update(editingUser.id, values)
      message.success('更新成功')
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const userColumns = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div><Text strong>{record.realName}</Text></div>
            <div><Text type="secondary">{record.username}</Text></div>
          </div>
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'purple' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '普通成员'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '激活' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            danger={record.status === 'ACTIVE'}
            icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 'ACTIVE' ? '禁用' : '激活'}
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={4} className="page-title">系统后台</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="用户总数" value={stats.userCount} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="团队数量" value={stats.teamCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="排班总数" value={stats.scheduleCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待审批调班" value={stats.swapCount} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card title="用户管理">
        <Table
          rowKey="id"
          dataSource={users}
          columns={userColumns}
          loading={loading}
        />
      </Card>

      <Modal
        title="编辑用户"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="realName" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
