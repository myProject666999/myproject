import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Upload, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons'
import { getSchoolIntros, createSchoolIntro, updateSchoolIntro, deleteSchoolIntro } from '../utils/api'

const { Search } = Input
const { TextArea } = Input

const SchoolIntroManagement = () => {
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
      const res = await getSchoolIntros({ page, pageSize, keyword })
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
        await updateSchoolIntro(editingItem.id, values)
        message.success('更新成功')
      } else {
        await createSchoolIntro(values)
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
      await deleteSchoolIntro(id)
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const uploadProps = {
    name: 'image',
    action: '/api/upload',
    onChange({ file, fileList }) {
      if (file.status === 'done') {
        form.setFieldValue('image', file.response.data.url)
      }
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      render: (image) => image ? <img src={image} className="image-preview" alt="" /> : '-'
    },
    { title: '简介', dataIndex: 'summary', key: 'summary', ellipsis: true },
    { title: '点赞数', dataIndex: 'likes', key: 'likes', width: 80 },
    { title: '点踩数', dataIndex: 'dislikes', key: 'dislikes', width: 80 },
    { title: '浏览数', dataIndex: 'views', key: 'views', width: 80 },
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
      <h2 className="page-title">学校简介管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="搜索标题"
          style={{ width: 250 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加简介
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
        title={editingItem ? '编辑学校简介' : '添加学校简介'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item label="简介摘要" name="summary">
            <TextArea rows={2} placeholder="请输入简介摘要" />
          </Form.Item>
          <Form.Item label="详细内容" name="content">
            <TextArea rows={6} placeholder="请输入详细内容" />
          </Form.Item>
          <Form.Item label="封面图片" name="image">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
            {form.getFieldValue('image') && (
              <img src={form.getFieldValue('image')} className="image-preview" style={{ marginTop: 8 }} alt="" />
            )}
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

export default SchoolIntroManagement
