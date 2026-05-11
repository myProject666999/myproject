import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Carousel, Input, Button, Typography, Space } from 'antd'
import { SearchOutlined, ShoppingCartOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const Home: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, petsData, newsData] = await Promise.all([
        api.get('/products?page_size=8'),
        api.get('/pets?page_size=8'),
        api.get('/news?page_size=6')
      ])
      setProducts(productsData.list || [])
      setPets(petsData.list || [])
      setNews(newsData.list || [])
    } catch (error) {
      console.error('加载数据失败', error)
    }
  }

  const handleSearch = () => {
    if (searchKeyword) {
      navigate(`/products?keyword=${encodeURIComponent(searchKeyword)}`)
    }
  }

  const carouselImages = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20dogs%20and%20cats%20rescue%20banner%20warm%20colors&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20adoption%20center%20happy%20animals&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20shelter%20volunteers%20caring%20for%20pets&image_size=landscape_16_9'
  ]

  return (
    <div>
      <Carousel autoplay style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
        {carouselImages.map((img, index) => (
          <div key={index}>
            <img src={img} alt={`banner-${index}`} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
          </div>
        ))}
      </Carousel>

      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row justify="center">
          <Col xs={24} md={16}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                size="large"
                placeholder="搜索宠物用品..."
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button type="primary" size="large" onClick={handleSearch}>
                搜索
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: 32 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <ShoppingCartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>热门宠物用品</Title>
          <Button type="link" onClick={() => navigate('/products')}>查看更多 →</Button>
        </Space>
        <Row gutter={[16, 16]}>
          {products.map(product => (
            <Col xs={12} sm={8} md={6} lg={3} key={product.id}>
              <Card
                hoverable
                className="product-card"
                onClick={() => navigate(`/products/${product.id}`)}
                cover={
                  <img
                    alt={product.name}
                    src={product.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20product%20placeholder&image_size=square'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={<Text ellipsis style={{ color: '#333' }}>{product.name}</Text>}
                  description={<span style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>¥{product.price}</span>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <HeartOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
          <Title level={3} style={{ margin: 0 }}>待领养宠物</Title>
          <Button type="link" onClick={() => navigate('/pets')}>查看更多 →</Button>
        </Space>
        <Row gutter={[16, 16]}>
          {pets.map(pet => (
            <Col xs={12} sm={8} md={6} key={pet.id}>
              <Card
                hoverable
                className="pet-card"
                onClick={() => navigate(`/pets/${pet.id}`)}
                cover={
                  <img
                    alt={pet.name}
                    src={pet.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20placeholder&image_size=square'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={<Text ellipsis style={{ color: '#333' }}>{pet.name}</Text>}
                  description={<span style={{ color: '#888' }}>{pet.breed || '未知品种'}</span>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>宠物资讯</Title>
          <Button type="link" onClick={() => navigate('/news')}>查看更多 →</Button>
        </Space>
        <Row gutter={[16, 16]}>
          {news.map(item => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <Card hoverable onClick={() => navigate(`/news/${item.id}`)}>
                <Row gutter={12}>
                  <Col span={8}>
                    <img
                      alt={item.title}
                      src={item.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=news%20placeholder&image_size=square'}
                      style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Col>
                  <Col span={16}>
                    <Text ellipsis style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>{item.title}</Text>
                    <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 12 }}>
                      {item.summary || item.content?.substring(0, 50)}
                    </Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default Home
