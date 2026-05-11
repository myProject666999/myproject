import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { getWaterMeters, createWaterMeter, updateWaterMeter, deleteWaterMeter, getUsers } from '../../utils/api'
import dayjs from 'dayjs'

const WaterMeterManagement = () => {
  const [data, setData] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const fetchData = async (meterNo = '') => {
    setLoading(true)
    try {
      const res = await getWaterMeters({ meter_no: meterNo })
      setData(res.data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (error) {
      console.error('Fetch users error:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchUsers()
  }, [])

  const handleSearch = () => {
    fetchData(searchText)
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      install_date: record.install_date ? dayjs(record.install_date) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteWaterMeter(id)
      message.success('删除成功')
      fetchData(searchText)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        install_date: values.install_date ? values.install_date.format('YYYY-MM-DD') : null
      }
      if (editingItem) {
        await updateWaterMeter(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await createWaterMeter(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData(searchText)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '水表编号', dataIndex: 'meter_no', key: 'meter_no' },
    {
      title: '所属用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user ? `${user.user_no} - ${user.real_name || user.username}` : '-'
    },
    { title: '初始读数 (吨)', dataIndex: 'initial_reading', key: 'initial_reading' },
    { title: '安装日期', dataIndex: 'install_date', key: 'install_date' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = { normal: '正常', damaged: '损坏', replaced: '已更换' }
        return map[status] || status
      }
    },
    { title: '安装位置', dataIndex: 'location', key: 'location', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
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
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input.Search
          placeholder="按水表编号搜索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增水表
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingItem ? '编辑水表' : '新增水表'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="meter_no"
            label="水表编号"
            rules={[{ required: true, message: '请输入水表编号' }]}
          >
            <Input placeholder="请输入水表编号" disabled={!!editingItem} />
          </Form.Item>
          <Form.Item
            name="user_id"
            label="所属用户"
            rules={[{ required: true, message: '请选择所属用户' }]}
          >
            <Select placeholder="请选择用户">
              {users.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.user_no} - {item.real_name || item.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="initial_reading"
            label="初始读数 (吨)"
            rules={[{ required: true, message: '请输入初始读数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入初始读数" />
          </Form.Item>
          <Form.Item name="install_date" label="安装日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="normal">
            <Select>
              <Select.Option value="normal">正常</Select.Option>
              <Select.Option value="damaged">损坏</Select.Option>
              <Select.Option value="replaced">已更换</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="location" label="安装位置">
            <Input placeholder="请输入安装位置" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WaterMeterManagement
