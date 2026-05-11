import React, { useState, useEffect } from 'react'
import { Card, Typography, Empty, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import AppLayout from '../components/Layout'
import { publicApi } from '../utils/api'

const { Title, Text, Paragraph } = Typography

function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)

  useEffect(() => {
    if (id) {
      loadNews()
    }
  }, [id])

  const loadNews = async () => {
    try {
      const res = await publicApi.getNewsDetail(id)
      setNews(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  if (!news) {
    return (
      <AppLayout>
        <Empty description="资讯不存在" />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>
      
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>{news.title}</Title>
          <div style={{ color: '#999' }}>
            <Text type="secondary">作者: {news.author || '管理员'}</Text>
            <Text type="secondary" style={{ marginLeft: 24 }}>
              发布时间: {dayjs(news.created_at).format('YYYY-MM-DD HH:mm')}
            </Text>
            <Text type="secondary" style={{ marginLeft: 24 }}>
              浏览: {news.views}
            </Text>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
          <Paragraph style={{ fontSize: 16, lineHeight: 2 }}>
            {news.content}
          </Paragraph>
        </div>
      </Card>
    </AppLayout>
  )
}

export default NewsDetail
