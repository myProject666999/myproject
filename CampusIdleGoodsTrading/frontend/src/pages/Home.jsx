import React, { useState, useEffect } from 'react'
import { Row, Col, Carousel, Card, Tag, Button, Typography, Space, Empty } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/Layout'
import { publicApi, userApi } from '../utils/api'
import { useUserStore } from '../store/useStore'

const { Title, Text } = Typography

function Home() {
  const navigate = useNavigate()
  const { user, setCartCount } = useUserStore()
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [hotProducts, setHotProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [bannerRes, categoryRes, hotRes, newRes, newsRes] = await Promise.all([
        publicApi.getBanners(),
        publicApi.getCategories(),
        publicApi.getHotProducts({ limit: 8 }),
        publicApi.getNewProducts({ limit: 8 }),
        publicApi.getNews({ page_size: 5 })
      ])
      setBanners(bannerRes.data || [])
      setCategories(categoryRes.data || [])
      setHotProducts(hotRes.data || [])
      setNewProducts(newRes.data || [])
      setNews(newsRes.data.list || [])
    } catch (error) {
      console.error(error)
      setBanners([])
      setCategories([])
      setHotProducts([])
      setNewProducts([])
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (e, product) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await userApi.addToCart({ product_id: product.id, quantity: 1 })
      const res = await userApi.getCartCount()
      setCartCount(res.data.count)
    } catch (error) {
      console.error(error)
    }
  }

  const ProductCard = ({ product }) => {
    const productName = product?.name || ''
    return (
      <Card
        hoverable
        className="product-card"
        cover={
          <img 
            alt={productName} 
            src={product?.image || 'https://picsum.photos/400/200'} 
            onClick={() => navigate(`/products/${product?.id}`)}
          />
        }
        actions={[
          <Button 
            type="text" 
            icon={<ShoppingCartOutlined />}
            onClick={(e) => handleAddToCart(e, product)}
          >
            加入购物车
          </Button>,
          <Button type="text" icon={<HeartOutlined />} onClick={(e) => {
            e.stopPropagation()
            if (!user) {
              navigate('/login')
              return
            }
            userApi.toggleFavorite(product?.id)
          }}>收藏</Button>
        ]}
      >
        <Card.Meta
          title={<div onClick={() => navigate(`/products/${product?.id}`)} style={{ cursor: 'pointer' }}>
            {productName.length > 30 ? productName.substring(0, 30) + '...' : productName}
          </div>}
          description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <span className="product-price">¥{product?.price || 0}</span>
                {product?.originalPrice > product?.price && (
                  <span className="product-original-price">¥{product?.originalPrice}</span>
                )}
              </div>
              <Space size={8}>
                <Tag color="blue">销量: {product?.sales || 0}</Tag>
                <Tag color="green">库存: {product?.stock || 0}</Tag>
              </Space>
            </Space>
          }
        />
      </Card>
    )
  }

  return (
    <AppLayout>
      {banners.length > 0 && (
        <div className="banner-carousel">
          <Carousel autoplay effect="fade">
            {banners.map(banner => (
              <div key={banner.id}>
                <img src={banner.image} alt={banner.title} />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      {categories.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">商品分类</div>
          <Row gutter={[16, 16]}>
            {categories.map(cat => (
              <Col xs={12} sm={8} md={6} lg={4} key={cat.id}>
                <Card 
                  hoverable 
                  className="category-tag"
                  onClick={() => navigate(`/products?category_id=${cat.id}`)}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {cat.description || '查看商品'}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {hotProducts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>热门商品</div>
            <Button type="link" onClick={() => navigate('/products')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {hotProducts.map(product => (
              <Col xs={12} sm={8} md={6} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {newProducts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>最新上架</div>
            <Button type="link" onClick={() => navigate('/products')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {newProducts.map(product => (
              <Col xs={12} sm={8} md={6} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {news.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>商品资讯</div>
            <Button type="link" onClick={() => navigate('/news')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Card>
            {news.map(item => (
              <div 
                key={item.id} 
                className="news-card"
                style={{ padding: 16, borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                onClick={() => navigate(`/news/${item.id}`)}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                  <Space>
                    <Text type="secondary">作者: {item.author || '管理员'}</Text>
                    <Text type="secondary">浏览: {item.views}</Text>
                  </Space>
                </Space>
              </div>
            ))}
          </Card>
        </div>
      )}
    </AppLayout>
  )
}

export default Home
