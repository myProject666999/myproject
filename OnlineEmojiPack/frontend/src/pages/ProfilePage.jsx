import React, { useState, useEffect } from 'react'
import {
  Tabs,
  Avatar,
  Button,
  Form,
  Input,
  message,
  Empty,
  Popconfirm,
  Tag,
  Space,
  Modal
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  HeartOutlined,
  AppstoreOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { userApi, materialApi, collectionApi } from '../api'
import { useUserStore } from '../store/userStore'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, setUser } = useUserStore()
  const [myMaterials, setMyMaterials] = useState([])
  const [myCollections, setMyCollections] = useState([])
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    fetchMyMaterials()
    fetchMyCollections()
  }, [user])

  const fetchMyMaterials = async () => {
    try {
      const res = await materialApi.myList({ current: 1, size: 100 })
      setMyMaterials(res.data.records || [])
    } catch (error) {
      console.error('获取我的素材失败:', error)
    }
  }

  const fetchMyCollections = async () => {
    try {
      const res = await collectionApi.myList({ current: 1, size: 100 })
      setMyCollections(res.data.records || [])
    } catch (error) {
      console.error('获取我的合集失败:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const values = await form.validateFields()
      const res = await userApi.update(values)
      setUser(res.data)
      message.success('更新成功')
      setEditModalVisible(false)
    } catch (error) {
      if (error.errorFields) return
      message.error(error.message || '更新失败')
    }
  }

  const handleDeleteMaterial = async (id) => {
    try {
      await materialApi.delete(id)
      message.success('删除成功')
      fetchMyMaterials()
    } catch (error) {
      message.error(error.message || '删除失败')
    }
  }

  const handleDeleteCollection = async (id) => {
    try {
      await collectionApi.delete(id)
      message.success('删除成功')
      fetchMyCollections()
    } catch (error) {
      message.error(error.message || '删除失败')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="main-content">
      <div className="profile-container">
        <div className="profile-header">
          <Avatar
            src={user.avatar}
            icon={<UserOutlined />}
            size={80}
            className="profile-avatar"
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 8 }}>{user.nickname}</h2>
            <p style={{ color: '#666', marginBottom: 4 }}>@{user.username}</p>
            {user.email && <p style={{ color: '#999', fontSize: 12 }}>📧 {user.email}</p>}
          </div>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                nickname: user.nickname,
                email: user.email,
                avatar: user.avatar
              })
              setEditModalVisible(true)
            }}
          >
            编辑资料
          </Button>
        </div>

        <Tabs
          defaultActiveKey="materials"
          items={[
            {
              key: 'materials',
              label: (
                <span>
                  <UploadOutlined />
                  我的素材 ({myMaterials.length})
                </span>
              ),
              children: (
                myMaterials.length === 0 ? (
                  <Empty description="暂无上传素材" />
                ) : (
                  <div className="waterfall-container">
                    {myMaterials.map(material => (
                      <div
                        key={material.id}
                        className="material-card"
                        onClick={() => navigate(`/materials/${material.id}`)}
                        style={{ position: 'relative' }}
                      >
                        <img
                          src={material.thumbnailUrl}
                          alt={material.title}
                          className="material-thumbnail"
                        />
                        <div className="material-info">
                          <div className="material-title">{material.title}</div>
                          <div className="material-meta">
                            <Space>
                              <Tag color="blue">{material.categoryName}</Tag>
                            </Space>
                            <div className="material-stats">
                              <span>👁 {material.viewCount}</span>
                              <span>⬇ {material.downloadCount}</span>
                            </div>
                            <Popconfirm
                              title="确定删除这个素材？"
                              onConfirm={(e) => {
                                e.stopPropagation()
                                handleDeleteMaterial(material.id)
                              }}
                              onCancel={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                style={{ marginTop: 8 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                删除
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            },
            {
              key: 'collections',
              label: (
                <span>
                  <AppstoreOutlined />
                  我的合集 ({myCollections.length})
                </span>
              ),
              children: (
                myCollections.length === 0 ? (
                  <Empty description="暂无合集" />
                ) : (
                  <div className="collection-grid">
                    {myCollections.map(collection => (
                      <div
                        key={collection.id}
                        className="collection-card"
                        onClick={() => navigate(`/collections/${collection.id}`)}
                        style={{ position: 'relative' }}
                      >
                        <img
                          src={collection.coverUrl || 'https://picsum.photos/400/200'}
                          alt={collection.title}
                          className="collection-cover"
                        />
                        <div className="collection-info">
                          <h4 style={{ marginBottom: 4 }}>{collection.title}</h4>
                          <Space>
                            <Tag color="blue">{collection.materialCount} 个素材</Tag>
                          </Space>
                          <Popconfirm
                            title="确定删除这个合集？"
                            onConfirm={(e) => {
                              e.stopPropagation()
                              handleDeleteCollection(collection.id)
                            }}
                            onCancel={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              style={{ marginTop: 8 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              删除
                            </Button>
                          </Popconfirm>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            }
          ]}
        />
      </div>

      <Modal
        title="编辑资料"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="头像URL">
            <Input placeholder="请输入头像图片URL" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => setEditModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfilePage
