import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Tag, Select, Descriptions } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { getForumPosts, getForumPostDetail, updateForumPost, deleteForumPost } from '../utils/api'

const { Search } = Input
const { TextArea } = Input

const ForumManagement = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentPost, setCurrentPost] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await getForumPosts({ page, pageSize, keyword, status })
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
  }, [keyword, status])

  const handleView = async (id) => {
    try {
      const res = await getForumPostDetail(id)
      setCurrentPost(res.data)
      setDetailModalVisible(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = async (record) => {
    setCurrentPost(record)
    form.setFieldsValue({ title: record.title, content: record.content, status: record.status })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()
      await updateForumPost(currentPost.id, values)
      message.success('更新成功')
      setEditModalVisible(false)
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteForumPost(id)
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '帖子标题', dataIndex: 'title', key: 'title' },
    { title: '作者', dataIndex: 'author_name', key: 'author_name', width: 120 },
    { title: '浏览量', dataIndex: 'views', key: 'views', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '已屏蔽'}
        </Tag>
      )
    },
    { title: '发布时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
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
      <h2 className="page-title">论坛管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="搜索帖子标题"
          style={{ width: 250 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="状态筛选"
          style={{ width: 150 }}
          allowClear
          onChange={setStatus}
        >
          <Select.Option value={1}>正常</Select.Option>
          <Select.Option value={0}>已屏蔽</Select.Option>
        </Select>
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
        title="帖子详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentPost && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="标题">{currentPost.title}</Descriptions.Item>
            <Descriptions.Item label="作者">{currentPost.author_name}</Descriptions.Item>
            <Descriptions.Item label="浏览量">{currentPost.views}</Descriptions.Item>
            <Descriptions.Item label="发布时间">{currentPost.created_at}</Descriptions.Item>
            <Descriptions.Item label="内容">
              <div style={{ whiteSpace: 'pre-wrap' }}>{currentPost.content}</div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="编辑帖子"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select>
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={0}>已屏蔽</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ForumManagement
