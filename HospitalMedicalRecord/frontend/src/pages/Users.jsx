import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Input, Select, Modal, Tag, message, Popconfirm, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, KeyOutlined } from '@ant-design/icons'
import request from '../utils/request'

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'doctor', label: '医生' },
  { value: 'nurse', label: '护士' },
]

const statusOptions = [
  { value: 1, label: '启用' },
  { value: 0, label: '禁用' },
]

const Users = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/users', {
        params: {
          page,
          page_size: pageSize,
          ...params,
        },
      })
      setData(res.data.data)
      setPagination({
        current: page,
        pageSize,
        total: res.data.total,
      })
    } catch (error) {
      console.error('Fetch users error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = (values) => {
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchData(1, pagination.pageSize)
  }

  const handleTableChange = (pagination) => {
    const values = searchForm.getFieldsValue()
    fetchData(pagination.current, pagination.pageSize, values)
  }

  const handleAdd = () => {
    setEditingId(null)
    setModalTitle('新增用户')
    form.resetFields()
    form.setFieldsValue({ status: 1, role: 'nurse' })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setModalTitle('编辑用户')
    form.setFieldsValue({
      ...record,
      password: '',
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/users/${id}`)
      message.success('删除成功')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Delete user error:', error)
    }
  }

  const handleResetPassword = async (id) => {
    try {
      await request.post(`/users/${id}/reset-password`)
      message.success('密码已重置为 123456')
    } catch (error) {
      console.error('Reset password error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingId) {
        const updateData = { ...values }
        if (!updateData.password) {
          delete updateData.password
        }
        await request.put(`/users/${editingId}`, updateData)
        message.success('更新成功')
      } else {
        await request.post('/users', values)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Submit user error:', error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'admin' ? 'red' : role === 'doctor' ? 'blue' : 'green'
        const text = role === 'admin' ? '管理员' : role === 'doctor' ? '医生' : '护士'
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" icon={<KeyOutlined />} onClick={() => handleResetPassword(record.id)}>
            重置密码
          </Button>
          {record.id !== 1 && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">用户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      <Card>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          className="search-form"
        >
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="用户名/姓名/电话" />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select placeholder="全部角色" style={{ width: 120 }} allowClear>
              {roleOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingId} />
          </Form.Item>
          
          {!editingId && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
          {editingId && (
            <Form.Item
              name="password"
              label="新密码"
              rules={[{ min: 6, message: '密码至少6位' }]}
              extra="留空则不修改密码"
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          )}
          
          <Form.Item
            name="real_name"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roleOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态">
              {statusOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Users
