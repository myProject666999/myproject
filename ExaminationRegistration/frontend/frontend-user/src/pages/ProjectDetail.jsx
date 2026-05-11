import React, { useEffect, useState } from 'react'
import { Card, Button, message, Typography, Space, Descriptions } from 'antd'
import { ShoppingCartOutlined, StarOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectDetail, addToCart, addFavorite, checkFavorite } from '../utils/api'

const { Title, Paragraph } = Typography

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const res = await getProjectDetail(id)
      setProject(res.data)
      
      const token = localStorage.getItem('token')
      if (token) {
        const favRes = await checkFavorite({ target_type: 'project', target_id: id })
        setIsFavorite(favRes.data.is_favorite)
      }
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    try {
      await addToCart({ project_id: parseInt(id) })
      message.success('已加入购物车')
    } catch (error) {
      console.error('Add to cart error:', error)
    }
  }

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    try {
      await addToCart({ project_id: parseInt(id) })
      navigate('/cart')
    } catch (error) {
      console.error('Buy now error:', error)
    }
  }

  const handleFavorite = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    try {
      await addFavorite({ target_type: 'project', target_id: parseInt(id) })
      message.success('收藏成功')
      setIsFavorite(true)
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  if (!project) return null

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              height: 400, 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 160,
              borderRadius: 8
            }}>
              📚
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <Title level={2}>{project.name}</Title>
            
            <div style={{ marginBottom: 16 }}>
              <span className="price" style={{ fontSize: 36 }}>¥{project.price}</span>
              <span className="original-price" style={{ fontSize: 18 }}>¥{project.original_price}</span>
            </div>
            
            <Descriptions column={1}>
              <Descriptions.Item label="分类">{project.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="时长">{project.duration || '-'}</Descriptions.Item>
              <Descriptions.Item label="浏览量">{project.view_count}</Descriptions.Item>
            </Descriptions>
            
            <Space style={{ marginTop: 32 }}>
              <Button 
                type="primary" 
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleBuyNow}
              >
                立即购买
              </Button>
              <Button 
                size="large"
                onClick={handleAddToCart}
              >
                加入购物车
              </Button>
              <Button 
                type={isFavorite ? 'primary' : 'default'}
                icon={<StarOutlined />}
                onClick={handleFavorite}
                disabled={isFavorite}
              >
                {isFavorite ? '已收藏' : '收藏'}
              </Button>
            </Space>
          </div>
        </div>
      </Card>
      
      <Card title="课程简介" style={{ marginTop: 24 }}>
        <Paragraph style={{ fontSize: 16, lineHeight: 2 }}>
          {project.description}
        </Paragraph>
      </Card>
    </div>
  )
}

export default ProjectDetail
