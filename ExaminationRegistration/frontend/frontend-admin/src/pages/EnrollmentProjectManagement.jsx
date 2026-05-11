import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Upload, InputNumber, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons'
import { getEnrollmentProjects, createEnrollmentProject, updateEnrollmentProject, deleteEnrollmentProject } from '../utils/api'

const { Search } = Input
const { TextArea } = Input

const EnrollmentProjectManagement = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await getEnrollmentProjects({ page, pageSize, keyword })
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
  }, [keyword])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await updateEnrollmentProject(editingItem.id, values)
        message.success('更新成功')
      } else {
        await createEnrollmentProject(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEnrollmentProject(id)
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    {
      title: '封面图片',
      dataIndex: 'image',
      key: 'image',
      render: (image) => image ? <img src={image} className="image-preview" alt="" /> : '-'
    },
    { title: '项目描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '价格(元)', dataIndex: 'price', key: 'price', width: 100 },
    { title: '考试时长(分钟)', dataIndex: 'exam_duration', key: 'exam_duration', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#ff4d4f' }}>
          {status === 1 ? '启用' : '禁用'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
            title="确定删除吗？"
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
      <h2 className="page-title">报名项目管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="按报考项目名称搜索"
          style={{ width: 300 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加项目
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: (page, pageSize) => fetchData(page, pageSize)
        }}
      />

      <Modal
        title={editingItem ? '编辑报名项目' : '添加报名项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item label="项目描述" name="description">
            <TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item label="详细信息" name="details">
            <TextArea rows={4} placeholder="请输入详细信息" />
          </Form.Item>
          <Form.Item
            label="价格(元)"
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入价格" />
          </Form.Item>
          <Form.Item
            label="考试时长(分钟)"
            name="exam_duration"
            rules={[{ required: true, message: '请输入考试时长' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入考试时长" />
          </Form.Item>
          <Form.Item label="封面图片" name="image">
            <Upload
              name="image"
              action="/api/upload"
              listType="picture"
              onChange={({ file }) => {
                if (file.status === 'done') {
                  form.setFieldValue('image', file.response.data.url)
                }
              }}
            >
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EnrollmentProjectManagement
