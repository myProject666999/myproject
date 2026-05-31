import React, { useState, useEffect } from 'react'
import { Descriptions, Tag, Button, Space, Divider, message, Spin, Modal } from 'antd'
import {
  DownloadOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  LeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { materialApi, collectionApi, userApi } from '../api'
import { useUserStore } from '../store/userStore'

const MaterialDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [myCollections, setMyCollections] = useState([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null)

  useEffect(() => {
    fetchMaterial()
    if (user) {
      fetchFavoriteStatus()
      fetchMyCollections()
    }
  }, [id, user])

  const fetchMaterial = async () => {
    try {
      const res = await materialApi.getById(id)
      setMaterial(res.data)
    } catch (error) {
      message.error('获取素材详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavoriteStatus = async () => {
    try {
      const res = await materialApi.favoriteStatus(id)
      setIsFavorited(res.data)
    } catch (error) {
      console.error('获取收藏状态失败:', error)
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

  const handleFavorite = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    try {
      await materialApi.favorite(id)
      setIsFavorited(!isFavorited)
      message.success(isFavorited ? '已取消收藏' : '已添加收藏')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDownload = async () => {
    try {
      await materialApi.download(id)
      const link = document.createElement('a')
      link.href = material.fileUrl
      link.download = material.title
      link.target = '_blank'
      link.click()
      message.success('开始下载')
    } catch (error) {
      message.error('下载失败')
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(material.fileUrl)
    message.success('链接已复制')
  }

  const handleAddToCollection = async () => {
    if (!selectedCollection) {
      message.warning('请选择合集')
      return
    }
    try {
      await collectionApi.addMaterial(selectedCollection, id)
      message.success('已添加到合集')
      setAddModalVisible(false)
    } catch (error) {
      message.error(error.message || '添加失败')
    }
  }

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="main-content">
        <div className="empty-container">
          <p>素材不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="detail-container">
        <Button
          icon={<LeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <img
              src={material.fileUrl}
              alt={material.title}
              className="detail-image"
              style={{ maxHeight: 500, objectFit: 'contain', background: '#f0f0f0' }}
            />
          </div>
          <div className="detail-info" style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 16 }}>{material.title}</h2>
            
            {material.description && (
              <p style={{ color: '#666', marginBottom: 16 }}>{material.description}</p>
            )}

            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="分类">{material.categoryName}</Descriptions.Item>
              <Descriptions.Item label="上传者">{material.uploaderName}</Descriptions.Item>
              <Descriptions.Item label="文件类型">{material.fileType}</Descriptions.Item>
              <Descriptions.Item label="尺寸">{material.width} x {material.height}</Descriptions.Item>
              <Descriptions.Item label="文件大小">
                {(material.fileSize / 1024).toFixed(2)} KB
              </Descriptions.Item>
            </Descriptions>

            <Space style={{ marginBottom: 16 }}>
              <Tag color="blue">
                <EyeOutlined /> 浏览 {material.viewCount}
              </Tag>
              <Tag color="green">
                <DownloadOutlined /> 下载 {material.downloadCount}
              </Tag>
              <Tag color="red">
                <HeartOutlined /> 收藏 {material.favoriteCount}
              </Tag>
            </Space>

            {material.isCopyright === 1 && (
              <div style={{ color: '#faad14', marginBottom: 16 }}>
                ⚠️ 此素材有版权限制，下载后请勿商用
              </div>
            )}

            {material.tags && material.tags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <span>标签: </span>
                {material.tags.map(tag => (
                  <Tag key={tag.id} color="purple">{tag.name}</Tag>
                ))}
              </div>
            )}

            <Divider />

            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载
              </Button>
              <Button
                icon={isFavorited ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                onClick={handleFavorite}
                danger={isFavorited}
              >
                {isFavorited ? '已收藏' : '收藏'}
              </Button>
              <Button icon={<CopyOutlined />} onClick={handleCopyUrl}>
                复制链接
              </Button>
              {user && (
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                >
                  添加到合集
                </Button>
              )}
            </Space>
          </div>
        </div>
      </div>

      <Modal
        title="添加到合集"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddToCollection}
        okText="添加"
      >
        {myCollections.length === 0 ? (
          <p>暂无合集，请先创建合集</p>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {myCollections.map(collection => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                style={{
                  padding: 12,
                  border: selectedCollection === collection.id ? '2px solid #1890ff' : '1px solid #eee',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginBottom: 8
                }}
              >
                <div style={{ fontWeight: 500 }}>{collection.title}</div>
                <div style={{ color: '#999', fontSize: 12 }}>
                  {collection.materialCount} 个素材
                </div>
              </div>
            ))}
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default MaterialDetailPage
