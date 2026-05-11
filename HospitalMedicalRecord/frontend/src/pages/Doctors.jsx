import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Input, Select, Modal, Tag, message, Popconfirm, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import request from '../utils/request'

const Doctors = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  const [users, setUsers] = useState([])

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/doctors', {
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
      console.error('Fetch doctors error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await request.get('/users', {
        params: { role: 'doctor', page_size: 100 },
      })
      setUsers(res.data.data || [])
    } catch (error) {
      console.error('Fetch users error:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchUsers()
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
    setModalTitle('新增医生')
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setModalTitle('编辑医生')
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/doctors/${id}`)
      message.success('删除成功')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Delete doctor error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingId) {
        await request.put(`/doctors/${editingId}`, values)
        message.success('更新成功')
      } else {
        await request.post('/doctors', values)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Submit doctor error:', error)
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
      title: '工号',
      dataIndex: 'employee_no',
      key: 'employee_no',
    },
    {
      title: '关联用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.real_name || '-',
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '职称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '专长',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个医生吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">医生管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增医生
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
            <Input placeholder="工号/科室/专长" />
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
            name="employee_no"
            label="工号"
            rules={[{ required: true, message: '请输入工号' }]}
          >
            <Input placeholder="请输入工号" />
          </Form.Item>
          
          <Form.Item
            name="department"
            label="科室"
            rules={[{ required: true, message: '请输入科室' }]}
          >
            <Input placeholder="请输入科室" />
          </Form.Item>
          
          <Form.Item name="title" label="职称">
            <Input placeholder="请输入职称" />
          </Form.Item>
          
          <Form.Item name="specialty" label="专长">
            <Input placeholder="请输入专长" />
          </Form.Item>
          
          <Form.Item name="user_id" label="关联用户">
            <Select placeholder="请选择关联用户" allowClear>
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.real_name} ({user.username})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Doctors
