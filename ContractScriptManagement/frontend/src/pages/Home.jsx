import { useEffect, useState } from 'react'
import { Carousel, Card, Row, Col, Typography, Button } from 'antd'
import { Link } from 'react-router-dom'
import { carouselApi, scriptApi, newsApi } from '../services/api'
import WebLayout from '../components/Layout'

const { Title, Text } = Typography

function Home() {
  const [carousels, setCarousels] = useState([])
  const [hotScripts, setHotScripts] = useState([])
  const [latestNews, setLatestNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [carouselRes, scriptRes, newsRes] = await Promise.all([
        carouselApi.list(),
        scriptApi.hot(),
        newsApi.list({ page: 1, page_size: 4 })
      ])
      setCarousels(carouselRes.data || [])
      setHotScripts(scriptRes.data || [])
      setLatestNews(newsRes.data?.list || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <WebLayout>
      {carousels.length > 0 && (
        <Carousel autoplay style={{ marginBottom: 30, borderRadius: 8, overflow: 'hidden' }}>
          {carousels.map((item) => (
            <div key={item.id}>
              <img
                src={item.image}
                alt={item.title}
                style={{ width: '100%', height: 400, objectFit: 'cover' }}
              />
            </div>
          ))}
        </Carousel>
      )}

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0 }}>🔥 热门剧本</Title>
          <Link to="/scripts">查看更多 →</Link>
        </div>
        <Row gutter={[16, 16]}>
          {hotScripts.map((script) => (
            <Col key={script.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <img
                    src={script.cover || 'https://placehold.co/400x300?text=剧本'}
                    alt={script.title}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={<Link to={`/scripts/${script.id}`}>{script.title}</Link>}
                  description={
                    <div>
                      <Text type="secondary">{script.type?.name}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text strong style={{ color: '#f5222d' }}>¥{script.price}</Text>
                        <Text type="secondary" style={{ marginLeft: 12 }}>{script.players}人</Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0 }}>📰 最新资讯</Title>
          <Link to="/news">查看更多 →</Link>
        </div>
        <Row gutter={[16, 16]}>
          {latestNews.map((news) => (
            <Col key={news.id} xs={24} sm={12} md={6}>
              <Card
                hoverable
                cover={
                  <img
                    src={news.cover || 'https://placehold.co/400x200?text=资讯'}
                    alt={news.title}
                    style={{ height: 150, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={<Link to={`/news/${news.id}`}>{news.title}</Link>}
                  description={
                    <div>
                      <Text type="secondary">{news.author} · {news.views}阅读</Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </WebLayout>
  )
}

export default Home
