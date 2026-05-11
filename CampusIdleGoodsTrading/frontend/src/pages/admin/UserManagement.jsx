import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Input, message, Popconfirm, Switch, Typography, Tag } from 'antd'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { adminApi } from '../../utils/api'

const { Title } = Typography

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadUsers()
  }, [pagination.current, pagination.pageSize])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...(keyword && { keyword })
      }
      const res = await adminApi.getUsers(params)
      setUsers(res.data.list || [])
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(p => ({ ...p, current: 1 }))
    loadUsers()
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(id)
      message.success('删除成功')
      loadUsers()
    } catch (error) {
      console.error(error)
    }
  }

  const handleStatusChange = async (id, checked) => {
    try {
      await adminApi.updateUserStatus(id, { status: checked ? 1 : 0 })
      message.success('更新成功')
      loadUsers()
    } catch (error) {
      console.error(error)
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      )
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>用户管理</Title>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索用户名/昵称/邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            value={keyword}
            onSearch={handleSearch}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize }))
        }}
      />
    </div>
  )
}

export default UserManagement
