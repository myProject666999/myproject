import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Button, Image, Empty, message, Tag } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const MyFavorites: React.FC = () => {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await api.get('/favorites')
      setFavorites(data || [])
    } catch (error) {
      console.error('加载收藏失败', error)
    }
  }

  const removeFavorite = async (id: number) => {
    try {
      await api.delete(`/favorites/${id}`)
      message.success('已取消收藏')
      loadFavorites()
    } catch (error: any) {
      message.error(error.message || '取消失败')
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>我的收藏</Title>

      {favorites.length === 0 ? (
        <Empty description="暂无收藏" />
      ) : (
        <Row gutter={[24, 24]}>
          {favorites.map(item => (
            <Col span={6} key={item.id}>
              <Card
                hoverable
                cover={
                  <Image
                    src={item.product?.cover_image || item.pet?.photo || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20placeholder&image_size=square'}
                    height={200}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                    onClick={() => {
                      if (item.favorite_type === 'product') {
                        navigate(`/products/${item.product_id}`)
                      } else if (item.favorite_type === 'pet') {
                        navigate(`/pets/${item.pet_id}`)
                      }
                    }}
                  />
                }
                actions={[
                  <Button type="text" danger icon={<HeartOutlined />} onClick={() => removeFavorite(item.id)}>
                    取消收藏
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <span>
                      <Tag color={item.favorite_type === 'product' ? 'blue' : 'green'}>
                        {item.favorite_type === 'product' ? '商品' : '宠物'}
                      </Tag>
                      <Text strong>{item.product?.name || item.pet?.name}</Text>
                    </span>
                  }
                  description={
                    item.product ? (
                      <Text type="danger">¥{item.product.price}</Text>
                    ) : (
                      <Text type="secondary">{item.pet?.breed}</Text>
                    )
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default MyFavorites
