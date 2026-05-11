import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import {
  UserOutlined, ShoppingCartOutlined, ShopOutlined, HeartOutlined,
  FileTextOutlined, ShoppingOutlined
} from '@ant-design/icons'
import api from '../../api'

const { Title } = Typography

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    users: 0,
    products: 0,
    shops: 0,
    pets: 0,
    orders: 0,
    posts: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const users = await api.get('/admin/users')
      const products = await api.get('/products')
      const shops = await api.get('/shops')
      const pets = await api.get('/pets')
      const orders = await api.get('/admin/orders')
      const posts = await api.get('/posts')

      setStats({
        users: users.total || 0,
        products: products.total || 0,
        shops: shops.total || 0,
        pets: pets.total || 0,
        orders: orders.total || 0,
        posts: posts.total || 0
      })
    } catch (error) {
      console.error('加载统计失败', error)
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>数据概览</Title>

      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.products}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="商店总数"
              value={stats.shops}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="宠物总数"
              value={stats.pets}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="帖子总数"
              value={stats.posts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
