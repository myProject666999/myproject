import React, { useEffect, useState } from 'react'
import { Card, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import api from '../api'

const { Title, Text, Paragraph } = Typography

const NewsDetail: React.FC = () => {
  const { id } = useParams()
  const [news, setNews] = useState<any>(null)

  useEffect(() => {
    loadNews()
  }, [id])

  const loadNews = async () => {
    try {
      const data = await api.get(`/news/${id}`)
      setNews(data)
    } catch (error) {
      console.error('加载资讯失败', error)
    }
  }

  if (!news) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <Title level={2}>{news.title}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          浏览 {news.views} 次 · {new Date(news.created_at).toLocaleDateString()}
        </Text>
        <div dangerouslySetInnerHTML={{ __html: news.content || '' }} />
      </Card>
    </div>
  )
}

export default NewsDetail
