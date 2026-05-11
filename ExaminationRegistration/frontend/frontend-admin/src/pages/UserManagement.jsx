import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { getUsers, deleteUser, batchDeleteUsers } from '../utils/api'

const { Search } = Input

const UserManagement = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await getUsers({ page, pageSize, keyword, role })
      setData(res.data.items || [])
      setPagination({
        current: page,
        pageSize,
        total: res.data.total || 0
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [keyword, role])

  const handleDelete = async (id) => {
    try {
      await deleteUser(id)
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户')
      return
    }
    try {
      await batchDeleteUsers(selectedRowKeys)
      message.success('批量删除成功')
      setSelectedRowKeys([])
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()
      await deleteUser(editingUser.id)
      message.success('更新成功')
      setEditModalVisible(false)
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2 className="page-title">用户管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="搜索用户名/邮箱"
          style={{ width: 250 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="角色筛选"
          style={{ width: 150 }}
          allowClear
          onChange={setRole}
        >
          <Select.Option value="user">普通用户</Select.Option>
          <Select.Option value="admin">管理员</Select.Option>
        </Select>
        <Popconfirm
          title="确定批量删除选中的用户吗？"
          onConfirm={handleBatchDelete}
        >
          <Button danger disabled={selectedRowKeys.length === 0}>
            批量删除 ({selectedRowKeys.length})
          </Button>
        </Popconfirm>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: (page, pageSize) => fetchData(page, pageSize)
        }}
      />

      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户名" name="username">
            <Input disabled />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="电话" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select>
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
