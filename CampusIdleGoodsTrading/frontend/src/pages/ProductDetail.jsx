import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Typography, Space, Tag, Input, InputNumber, message, Descriptions, List, Avatar, Rate, Empty, Modal, Form } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, ShoppingOutlined, CommentOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import AppLayout from '../components/Layout'
import { publicApi, userApi } from '../utils/api'
import { useUserStore } from '../store/useStore'

const { Title, Text, Paragraph } = Typography

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, setCartCount } = useUserStore()
  
  const [product, setProduct] = useState(null)
  const [comments, setComments] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (id) {
      loadProduct()
      loadComments()
      if (user) {
        checkFavorite()
      }
    }
  }, [id, user])

  const loadProduct = async () => {
    try {
      const res = await publicApi.getProduct(id)
      setProduct(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadComments = async () => {
    try {
      const res = await publicApi.getComments(id, { page_size: 20 })
      setComments(res.data.list || [])
    } catch (error) {
      console.error(error)
    }
  }

  const checkFavorite = async () => {
    try {
      const res = await userApi.isFavorite(id)
      setIsFavorite(res.data.is_favorite)
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const res = await userApi.toggleFavorite(id)
      setIsFavorite(res.data.is_favorite)
      message.success(res.data.is_favorite ? '已收藏' : '已取消收藏')
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await userApi.addToCart({ product_id: product.id, quantity })
      const res = await userApi.getCartCount()
      setCartCount(res.data.count)
      message.success('已加入购物车')
    } catch (error) {
      console.error(error)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const addressesRes = await userApi.getAddresses()
      if (addressesRes.data.length === 0) {
        message.warning('请先添加收货地址')
        navigate('/profile/addresses')
        return
      }
      
      navigate('/checkout', { 
        state: { 
          items: [{ product_id: product.id, quantity }] 
        } 
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddComment = async (values) => {
    try {
      await userApi.addComment(id, values)
      message.success('评论成功')
      setCommentModalVisible(false)
      form.resetFields()
      loadComments()
    } catch (error) {
      console.error(error)
    }
  }

  if (!product) {
    return (
      <AppLayout>
        <Empty description="商品不存在" />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col md={12}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={product.image || 'https://picsum.photos/500/500'} 
                alt={product.name}
                className="product-detail-image"
              />
            </div>
          </Col>
          <Col md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={2}>{product.name}</Title>
              
              <div>
                <span className="product-price" style={{ fontSize: 28 }}>¥{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="product-original-price" style={{ fontSize: 18, marginLeft: 12 }}>
                    ¥{product.originalPrice}
                  </span>
                )}
              </div>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="分类">{product.category?.name || '未分类'}</Descriptions.Item>
                <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
                <Descriptions.Item label="销量">{product.sales} 件</Descriptions.Item>
                <Descriptions.Item label="浏览量">{product.views} 次</Descriptions.Item>
              </Descriptions>

              <Space>
                <Text>数量:</Text>
                <InputNumber 
                  min={1} 
                  max={product.stock} 
                  value={quantity} 
                  onChange={setQuantity}
                />
              </Space>

              <Space size="middle">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                >
                  加入购物车
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  danger
                  icon={<ShoppingOutlined />}
                  onClick={handleBuyNow}
                >
                  立即购买
                </Button>
                <Button 
                  size="large"
                  type={isFavorite ? 'primary' : 'default'}
                  icon={<HeartOutlined />}
                  onClick={handleToggleFavorite}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
              </Space>

              {user && (
                <Button 
                  type="link"
                  icon={<CommentOutlined />}
                  onClick={() => setCommentModalVisible(true)}
                >
                  发表评论
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="商品详情" style={{ marginBottom: 24 }}>
        <Paragraph>{product.description || '暂无商品描述'}</Paragraph>
      </Card>

      <Card title={`商品评价 (${comments.length})`}>
        {comments.length > 0 ? (
          <List
            dataSource={comments}
            renderItem={comment => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{comment.user?.nickname?.[0] || comment.user?.username?.[0]}</Avatar>}
                  title={
                    <Space>
                      <span>{comment.user?.nickname || comment.user?.username}</span>
                      <Rate disabled defaultValue={comment.rating} style={{ fontSize: 14 }} />
                    </Space>
                  }
                  description={
                    <Space direction="vertical">
                      <Text>{comment.content}</Text>
                      <Text type="secondary">{dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无评价" />
        )}
      </Card>

      <Modal
        title="发表评论"
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddComment}>
          <Form.Item label="评分" name="rating" initialValue={5}>
            <Rate />
          </Form.Item>
          <Form.Item label="评价内容" name="content" rules={[{ required: true, message: '请输入评价内容' }]}>
            <Input.TextArea rows={4} placeholder="请输入您的评价..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCommentModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">提交</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  )
}

export default ProductDetail
