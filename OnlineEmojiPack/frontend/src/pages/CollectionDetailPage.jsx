import React, { useState, useEffect } from 'react'
import {
  Button,
  Space,
  Tag,
  message,
  Spin,
  Empty,
  Popconfirm,
  Divider
} from 'antd'
import {
  LeftOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HeartOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { collectionApi, materialApi } from '../api'
import { useUserStore } from '../store/userStore'

const CollectionDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingMaterial, setAddingMaterial] = useState(false)

  useEffect(() => {
    fetchCollection()
  }, [id])

  const fetchCollection = async () => {
    try {
      const res = await collectionApi.getById(id)
      setCollection(res.data)
    } catch (error) {
      message.error('获取合集详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMaterial = async (materialId) => {
    try {
      await collectionApi.removeMaterial(id, materialId)
      message.success('已从合集中移除')
      fetchCollection()
    } catch (error) {
      message.error(error.message || '移除失败')
    }
  }

  const handleDownloadAll = () => {
    if (!collection?.materials) return
    collection.materials.forEach((material, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = material.fileUrl
        link.download = material.title
        link.target = '_blank'
        link.click()
      }, index * 500)
    })
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

  if (!collection) {
    return (
      <div className="main-content">
        <Empty description="合集不存在" />
      </div>
    )
  }

  const isOwner = user && collection.userId === user.id

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

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>{collection.title}</h2>
          {collection.description && (
            <p style={{ color: '#666' }}>{collection.description}</p>
          )}
          <Space style={{ marginTop: 8 }}>
            <Tag color="blue">by {collection.userName}</Tag>
            <Tag color="green">{collection.materialCount} 个素材</Tag>
            <Tag color="red">{collection.favoriteCount} 收藏</Tag>
            <Tag color="purple">{collection.viewCount} 浏览</Tag>
          </Space>
        </div>

        <Divider />

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h3>合集素材 ({collection.materials?.length || 0})</h3>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadAll}>
              下载全部
            </Button>
            <Button icon={<HeartOutlined />}>收藏合集</Button>
          </Space>
        </div>

        {collection.materials?.length === 0 ? (
          <Empty description="合集中暂无素材" />
        ) : (
          <div className="waterfall-container">
            {collection.materials?.map(material => (
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
                    <div className="material-stats">
                      <span>{material.downloadCount} 下载</span>
                    </div>
                    {isOwner && (
                      <Popconfirm
                        title="确定从合集中移除此素材？"
                        onConfirm={(e) => {
                          e.stopPropagation()
                          handleRemoveMaterial(material.id)
                        }}
                        onCancel={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionDetailPage
