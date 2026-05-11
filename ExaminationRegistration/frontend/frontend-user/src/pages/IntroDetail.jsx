import React, { useEffect, useState } from 'react'
import { Card, Button, message, Space, Typography } from 'antd'
import { LikeOutlined, DislikeOutlined, StarOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { getIntroDetail, likeIntro, dislikeIntro, addFavorite, checkFavorite } from '../utils/api'

const { Title, Paragraph } = Typography

const IntroDetail = () => {
  const { id } = useParams()
  const [intro, setIntro] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const res = await getIntroDetail(id)
      setIntro(res.data)
      
      const token = localStorage.getItem('token')
      if (token) {
        const favRes = await checkFavorite({ target_type: 'intro', target_id: id })
        setIsFavorite(favRes.data.is_favorite)
      }
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleLike = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      return
    }
    try {
      await likeIntro(id)
      message.success('点赞成功')
      setIntro(prev => ({ ...prev, like_count: prev.like_count + 1 }))
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handleDislike = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      return
    }
    try {
      await dislikeIntro(id)
      message.success('点踩成功')
      setIntro(prev => ({ ...prev, dislike_count: prev.dislike_count + 1 }))
    } catch (error) {
      console.error('Dislike error:', error)
    }
  }

  const handleFavorite = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      return
    }
    try {
      await addFavorite({ target_type: 'intro', target_id: parseInt(id) })
      message.success('收藏成功')
      setIsFavorite(true)
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  if (!intro) return null

  return (
    <div>
      <Card>
        <Title level={2}>{intro.title}</Title>
        <div style={{ color: '#999', marginBottom: 24 }}>
          👁 {intro.view_count} 浏览 · 👍 {intro.like_count} 赞 · 👎 {intro.dislike_count} 踩
        </div>
        
        <div style={{ 
          height: 300, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 120,
          marginBottom: 24,
          borderRadius: 8
        }}>
          🏫
        </div>

        <Paragraph style={{ fontSize: 16, lineHeight: 2 }}>
          {intro.content}
        </Paragraph>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Space size="large">
            <Button 
              type="primary" 
              icon={<LikeOutlined />}
              onClick={handleLike}
            >
              赞一下
            </Button>
            <Button 
              icon={<DislikeOutlined />}
              onClick={handleDislike}
            >
              踩一下
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
      </Card>
    </div>
  )
}

export default IntroDetail
