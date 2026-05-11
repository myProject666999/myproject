import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Image, Button, Typography, InputNumber, message, Descriptions, Tag } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text, Paragraph } = Typography

const ProductDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const data = await api.get(`/products/${id}`)
      setProduct(data)
    } catch (error) {
      console.error('加载商品失败', error)
    }
  }

  const addToCart = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      await api.post('/cart', { product_id: product.id, quantity })
      message.success('已加入购物车')
    } catch (error: any) {
      message.error(error.message || '添加失败')
    } finally {
      setLoading(false)
    }
  }

  const buyNow = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    await addToCart()
    navigate('/cart')
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <Image
              width="100%"
              src={product.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20product%20placeholder&image_size=square'}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Title level={2}>{product.name}</Title>
            <div style={{ marginBottom: 16 }}>
              <span style={{ color: '#ff4d4f', fontSize: 28, fontWeight: 'bold' }}>¥{product.price}</span>
              {product.original_price && (
                <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: 16 }}>¥{product.original_price}</span>
              )}
            </div>

            <Descriptions column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="分类">{product.product_category?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
              <Descriptions.Item label="销量">{product.sales} 件</Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ marginRight: 16 }}>数量：</Text>
              <InputNumber
                min={1}
                max={product.stock || 99}
                value={quantity}
                onChange={setQuantity}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={addToCart}
                loading={loading}
              >
                加入购物车
              </Button>
              <Button
                size="large"
                type="primary"
                danger
                onClick={buyNow}
              >
                立即购买
              </Button>
              <Button
                size="large"
                icon={<HeartOutlined />}
              >
                收藏
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="商品详情" style={{ marginTop: 24 }}>
        <Paragraph>{product.description}</Paragraph>
        <div dangerouslySetInnerHTML={{ __html: product.content || '' }} />
      </Card>
    </div>
  )
}

export default ProductDetail
