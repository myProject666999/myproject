import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography, Spin } from 'antd'
import { newsApi } from '../services/api'
import WebLayout from '../components/Layout'

const { Title, Paragraph, Text } = Typography

function NewsDetail() {
  const { id } = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await newsApi.get(id)
      setNews(res.data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <WebLayout><div style={{ padding: 100, textAlign: 'center' }}>加载中...</div></WebLayout>
  if (!news) return <WebLayout><div style={{ padding: 100, textAlign: 'center' }}>资讯不存在</div></WebLayout>

  return (
    <WebLayout>
      <Card>
        <Title level={2}>{news.title}</Title>
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary">
            作者：{news.author || '管理员'}
            <span style={{ marginLeft: 16 }}>{news.views}阅读</span>
            <span style={{ marginLeft: 16 }}>
              发布于 {new Date(news.created_at).toLocaleString()}
            </span>
          </Text>
        </div>
        {news.cover && (
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <img
              src={news.cover}
              alt={news.title}
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 4 }}
            />
          </div>
        )}
        <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.8 }}>
          {news.content}
        </Paragraph>
      </Card>
    </WebLayout>
  )
}

export default NewsDetail
