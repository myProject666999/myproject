import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Pagination, Typography, Image } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text, Paragraph } = Typography

const News: React.FC = () => {
  const navigate = useNavigate()
  const [news, setNews] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    loadNews()
  }, [page])

  const loadNews = async () => {
    try {
      const data = await api.get(`/news?page=${page}&page_size=${pageSize}`)
      setNews(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载资讯失败', error)
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>宠物资讯</Title>

      <Row gutter={[24, 24]}>
        {news.map(item => (
          <Col span={24} key={item.id}>
            <Card
              hoverable
              onClick={() => navigate(`/news/${item.id}`)}
            >
              <Row gutter={24}>
                <Col span={6}>
                  <Image
                    width="100%"
                    height={180}
                    src={item.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20news%20placeholder&image_size=landscape_4_3'}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                    preview={false}
                  />
                </Col>
                <Col span={18}>
                  <Title level={4} style={{ marginBottom: 8 }}>{item.title}</Title>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                    {item.summary || item.content}
                  </Paragraph>
                  <Text type="secondary">
                    浏览 {item.views} 次 · {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {news.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  )
}

export default News
