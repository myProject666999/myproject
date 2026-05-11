import React, { useEffect, useState } from 'react'
import { Table, Button, Typography, Modal, Form, Input, Select, Space, message, Tag, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../api'

const { Title } = Typography

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/users')
      setUsers(data.list || [])
    } catch (error) {
      console.error('加载用户失败', error)
    } finally {
      setLoading(false)
    }
  }

  const showModal = (user?: any) => {
    setEditingUser(user || null)
    if (user) {
      form.setFieldsValue(user)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, values)
        message.success('用户已更新')
      } else {
        await api.post('/admin/users', values)
        message.success('用户已添加')
      }
      setModalVisible(false)
      loadUsers()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`)
      message.success('用户已删除')
      loadUsers()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname'
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
      key: 'role',
      render: (_: any, record: any) => (
        <Tag color={record.role === 'admin' ? 'red' : 'blue'}>
          {record.role === 'admin' ? '管理员' : '用户'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      key: 'created_at',
      render: (_: any, record: any) => new Date(record.created_at).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>用户管理</Title>

      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          添加用户
        </Button>
      </Card>

      <Card>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="user">
            <Select>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Users
