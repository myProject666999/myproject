import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import { UserOutlined, ShoppingOutlined, ShoppingCartOutlined, MoneyCollectOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

const { Title } = Typography

function Dashboard() {
  const [stats, setStats] = useState({
    user_count: 0,
    product_count: 0,
    order_count: 0,
    today_revenue: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await adminApi.getDashboardStats()
      setStats(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>数据概览</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="注册用户数"
              value={stats.user_count}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="上架商品数"
              value={stats.product_count}
              prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.order_count}
              prefix={<ShoppingCartOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={stats.today_revenue}
              precision={2}
              prefix={<MoneyCollectOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
