import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Pagination, Typography, Button } from 'antd'
import { PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const Shops: React.FC = () => {
  const navigate = useNavigate()
  const [shops, setShops] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    loadShops()
  }, [page])

  const loadShops = async () => {
    try {
      const data = await api.get(`/shops?page=${page}&page_size=${pageSize}`)
      setShops(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载商店失败', error)
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>宠物商店</Title>

      <Row gutter={[16, 16]}>
        {shops.map(shop => (
          <Col xs={24} sm={12} md={8} key={shop.id}>
            <Card
              hoverable
              onClick={() => navigate(`/shops/${shop.id}`)}
              cover={
                <img
                  alt={shop.name}
                  src={shop.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20shop%20placeholder&image_size=landscape_4_3'}
                  style={{ height: 180, objectFit: 'cover' }}
                />
              }
            >
              <Card.Meta
                title={<Text strong style={{ fontSize: 16 }}>{shop.name}</Text>}
                description={
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" ellipsis style={{ display: 'flex', alignItems: 'center' }}>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {shop.address}
                    </Text>
                    <Text type="secondary" style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      {shop.phone}
                    </Text>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {shops.length > 0 && (
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

export default Shops
