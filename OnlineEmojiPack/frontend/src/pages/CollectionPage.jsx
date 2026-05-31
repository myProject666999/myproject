import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Modal,
  Empty,
  Tag,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { collectionApi, materialApi } from '../api'
import { useUserStore } from '../store/userStore'

const CollectionPage = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    setLoading(true)
    try {
      const res = await collectionApi.list({ current: 1, size: 50 })
      setCollections(res.data.records || [])
    } catch (error) {
      message.error('获取合集列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      await collectionApi.create(values)
      message.success('创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchCollections()
    } catch (error) {
      if (error.errorFields) return
      message.error(error.message || '创建失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await collectionApi.delete(id)
      message.success('删除成功')
      fetchCollections()
    } catch (error) {
      message.error(error.message || '删除失败')
    }
  }

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>精选合集</h2>
        {user && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建合集
          </Button>
        )}
      </div>

      {collections.length === 0 ? (
        <Empty description="暂无合集" />
      ) : (
        <div className="collection-grid">
          {collections.map(collection => (
            <Card
              key={collection.id}
              hoverable
              cover={
                <img
                  src={collection.coverUrl || 'https://picsum.photos/400/200'}
                  alt={collection.title}
                  className="collection-cover"
                />
              }
              actions={[
                <EyeOutlined key="view" onClick={() => navigate(`/collections/${collection.id}`)} />,
                user && collection.userId === user.id && (
                  <Popconfirm
                    key="delete"
                    title="确定删除这个合集吗？"
                    onConfirm={() => handleDelete(collection.id)}
                  >
                    <DeleteOutlined />
                  </Popconfirm>
                )
              ].filter(Boolean)}
            >
              <Card.Meta
                title={collection.title}
                description={
                  <div>
                    {collection.description && (
                      <p style={{ color: '#666', marginBottom: 8 }}>
                        {collection.description.length > 50
                          ? collection.description.substring(0, 50) + '...'
                          : collection.description}
                      </p>
                    )}
                    <Space>
                      <Tag color="blue">{collection.materialCount} 个素材</Tag>
                      <Tag color="red">{collection.favoriteCount} 收藏</Tag>
                      <Tag color="green">{collection.viewCount} 浏览</Tag>
                    </Space>
                    <p style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                      by {collection.userName}
                    </p>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="创建合集"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="title"
            label="合集标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入合集标题" maxLength={200} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入合集描述（可选）" maxLength={500} />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面URL">
            <Input placeholder="请输入封面图片URL（可选）" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">创建</Button>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CollectionPage
