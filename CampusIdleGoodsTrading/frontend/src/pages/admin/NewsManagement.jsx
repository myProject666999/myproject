import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Typography, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'
import dayjs from 'dayjs'

const { Title } = Typography
const { TextArea } = Input

function NewsManagement() {
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [form] = Form.useForm()

  useEffect(() => {
    loadNews()
  }, [pagination.current, pagination.pageSize])

  const loadNews = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...(keyword && { keyword })
      }
      const res = await adminApi.getNews(params)
      setNewsList(res.data.list || [])
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(p => ({ ...p, current: 1 }))
    loadNews()
  }

  const handleAdd = () => {
    setEditingNews(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (news) => {
    setEditingNews(news)
    form.setFieldsValue(news)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteNews(id)
      message.success('删除成功')
      loadNews()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingNews) {
        await adminApi.updateNews(editingNews.id, values)
      } else {
        await adminApi.createNews(values)
      }
      message.success(editingNews ? '更新成功' : '添加成功')
      setModalVisible(false)
      loadNews()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (status === 1 ? '发布' : '草稿')
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除该资讯吗？"
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
      <Title level={2} style={{ marginBottom: 24 }}>资讯管理</Title>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索资讯标题"
            allowClear
            enterButton={<SearchOutlined />}
            value={keyword}
            onSearch={handleSearch}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加资讯
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={newsList}
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

      <Modal
        title={editingNews ? '编辑资讯' : '添加资讯'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <TextArea rows={2} placeholder="请输入摘要" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={6} placeholder="请输入内容" />
          </Form.Item>
          <Form.Item name="image" label="封面图片">
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={1}>
            <Switch checkedChildren="发布" unCheckedChildren="草稿" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NewsManagement
