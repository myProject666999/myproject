import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Pagination, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { newsApi } from '../services/api'
import WebLayout from '../components/Layout'

const { Title, Text } = Typography

function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadData()
  }, [pagination.current])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await newsApi.list({
        page: pagination.current,
        page_size: pagination.pageSize
      })
      setNews(res.data?.list || [])
      setPagination(prev => ({ ...prev, total: res.data?.total || 0 }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <WebLayout>
      <Title level={2}>剧本资讯</Title>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {news.map((item) => (
            <Col key={item.id} xs={24}>
              <Card hoverable>
                <Row gutter={16}>
                  <Col xs={24} md={6}>
                    <img
                      src={item.cover || 'https://placehold.co/300x200?text=资讯'}
                      alt={item.title}
                      style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Col>
                  <Col xs={24} md={18}>
                    <Title level={4}>
                      <Link to={`/news/${item.id}`}>{item.title}</Link>
                    </Title>
                    <Text type="secondary">
                      {item.author} · {item.views}阅读 · {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        {news.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text type="secondary">暂无资讯</Text>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
          />
        </div>
      </Spin>
    </WebLayout>
  )
}

export default News
