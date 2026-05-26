import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, List, Tag, Badge, Button, Space } from 'antd'
import { Link } from 'react-router-dom'
import {
  EnvironmentOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { cityAPI, alertAPI, getAQIBadgeClass, getAlertBadgeClass } from '../services/api.js'

function Dashboard() {
  const [citiesData, setCitiesData] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [citiesRes, alertsRes] = await Promise.all([
        cityAPI.getCitiesWithAQI(),
        alertAPI.getActiveAlerts(),
      ])
      setCitiesData(citiesRes.data.data)
      setAlerts(alertsRes.data.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalCities: citiesData.length,
    goodAir: citiesData.filter((c) => c.latest_record && c.latest_record.aqi <= 100).length,
    polluted: citiesData.filter((c) => c.latest_record && c.latest_record.aqi > 100).length,
    activeAlerts: alerts.length,
  }

  const sortedCities = [...citiesData].sort((a, b) => {
    if (!a.latest_record) return 1
    if (!b.latest_record) return -1
    return b.latest_record.aqi - a.latest_record.aqi
  })

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="监控城市数"
              value={stats.totalCities}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="空气质量优良"
              value={stats.goodAir}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="污染城市"
              value={stats.polluted}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃预警"
              value={stats.activeAlerts}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {alerts.length > 0 && (
        <Card
          title={<Space><WarningOutlined style={{ color: '#faad14' }} />最新预警</Space>}
          style={{ marginBottom: '24px' }}
          type="inner"
        >
          <List
            dataSource={alerts.slice(0, 5)}
            renderItem={(alert) => (
              <List.Item
                actions={[
                  <Button type="link" size="small">
                    <Link to={`/city/${alert.city_id}`}>查看详情 <ArrowRightOutlined /></Link>
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Badge status="error" />}
                  title={
                    <Space>
                      <span>{alert.city?.name}</span>
                      <span className={getAlertBadgeClass(alert.alert_level)}>
                        {alert.alert_level}预警
                      </span>
                    </Space>
                  }
                  description={alert.message}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card title="城市空气质量实时数据" loading={loading}>
        <Row gutter={[16, 16]}>
          {sortedCities.map((item) => (
            <Col span={6} key={item.city.id}>
              <Card
                hoverable
                size="small"
                extra={
                  item.hasActiveAlert && (
                    <Tag color="red" icon={<WarningOutlined />}>
                      预警
                    </Tag>
                  )
                }
                actions={[
                  <Link to={`/city/${item.city.id}`}>
                    查看详情 <ArrowRightOutlined />
                  </Link>,
                ]}
              >
                <Card.Meta
                  title={
                    <Space>
                      <EnvironmentOutlined />
                      {item.city.name}
                    </Space>
                  }
                  description={item.city.province}
                />
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  {item.latest_record ? (
                    <>
                      <div
                        className={getAQIBadgeClass(item.latest_record.aqi)}
                        style={{ fontSize: '24px', padding: '8px 16px', marginBottom: '8px' }}
                      >
                        {item.latest_record.aqi}
                      </div>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        {item.latest_record.aqi_level}
                        {item.latest_record.primary_pollutant && (
                          <span style={{ marginLeft: '8px' }}>
                            首要污染物: {item.latest_record.primary_pollutant}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#999' }}>暂无数据</div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
