import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Statistic,
  Descriptions,
  List,
  Tag,
  Button,
  Space,
  Empty,
} from 'antd'
import {
  EnvironmentOutlined,
  ArrowLeftOutlined,
  FireOutlined,
  CloudOutlined,
  ThunderboltFilled,
} from '@ant-design/icons'
import {
  cityAPI,
  aqiAPI,
  trendAPI,
  alertAPI,
  getAQIBadgeClass,
  getAQILevel,
  getAlertBadgeClass,
} from '../services/api.js'
import dayjs from 'dayjs'

function CityDetail() {
  const { id } = useParams()
  const [cityData, setCityData] = useState(null)
  const [latestAQI, setLatestAQI] = useState(null)
  const [history, setHistory] = useState([])
  const [trends, setTrends] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [cityRes, aqiRes, historyRes, trendsRes, alertsRes] = await Promise.all([
        cityAPI.getCityById(id),
        aqiAPI.getLatestAQI(id),
        aqiAPI.getAQIHistory(id, 24),
        trendAPI.getCityTrend(id, 7),
        alertAPI.getAlertsByCity(id, 10),
      ])

      setCityData(cityRes.data.data.city)
      setLatestAQI(aqiRes.data.data)
      setHistory(historyRes.data.data)
      setTrends(trendsRes.data.data)
      setAlerts(alertsRes.data.data)
    } catch (error) {
      console.error('Failed to load city data:', error)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    window.history.back()
  }

  if (loading && !cityData) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
  }

  if (!cityData) {
    return <Empty description="未找到城市信息" />
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={goBack} style={{ marginBottom: '16px' }}>
        返回
      </Button>

      <Card
        title={
          <Space>
            <EnvironmentOutlined />
            {cityData.name}
            <Tag color="blue">{cityData.province}</Tag>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="AQI 指数"
              value={latestAQI?.aqi || '-'}
              formatter={(value) => (
                <span className={getAQIBadgeClass(value)} style={{ fontSize: '48px' }}>
                  {value}
                </span>
              )}
            />
            <div style={{ marginTop: '8px', fontSize: '18px' }}>
              {latestAQI ? getAQILevel(latestAQI.aqi) : '-'}
            </div>
          </Col>
          <Col span={8}>
            {latestAQI && (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="首要污染物">
                  {latestAQI.primary_pollutant || '无'}
                </Descriptions.Item>
                <Descriptions.Item label="PM2.5">
                  {latestAQI.pm25?.toFixed(2)} μg/m³
                </Descriptions.Item>
                <Descriptions.Item label="PM10">
                  {latestAQI.pm10?.toFixed(2)} μg/m³
                </Descriptions.Item>
                <Descriptions.Item label="O3">
                  {latestAQI.o3?.toFixed(2)} μg/m³
                </Descriptions.Item>
              </Descriptions>
            )}
          </Col>
          <Col span={8}>
            {latestAQI && (
              <Descriptions column={1} size="small">
                <Descriptions.Item label={
                  <Space><FireOutlined />温度</Space>
                }>
                  {latestAQI.temperature?.toFixed(1)}°C
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space><CloudOutlined />湿度</Space>
                }>
                  {latestAQI.humidity?.toFixed(0)}%
                </Descriptions.Item>
                <Descriptions.Item label={
                  <Space><ThunderboltFilled />风向/风速</Space>
                }>
                  {latestAQI.wind_direction} {latestAQI.wind_speed?.toFixed(1)} m/s
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {latestAQI.record_time ? dayjs(latestAQI.record_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="污染物详情" size="small">
            {latestAQI && (
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Card size="small">
                    <Statistic title="SO₂ (μg/m³)" value={latestAQI.so2?.toFixed(2)} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic title="NO₂ (μg/m³)" value={latestAQI.no2?.toFixed(2)} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic title="CO (mg/m³)" value={latestAQI.co?.toFixed(3)} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small">
                    <Statistic title="O₃ (μg/m³)" value={latestAQI.o3?.toFixed(2)} />
                  </Card>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="历史预警" size="small">
            {alerts.length > 0 ? (
              <List
                size="small"
                dataSource={alerts}
                renderItem={(alert) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span className={getAlertBadgeClass(alert.alert_level)}>
                            {alert.alert_level}
                          </span>
                          <span>{alert.alert_type}</span>
                          <Tag color={alert.is_resolved ? 'green' : 'red'}>
                            {alert.is_resolved ? '已解除' : '进行中'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{alert.message}</div>
                          <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                            {dayjs(alert.start_time).format('YYYY-MM-DD HH:mm')}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无预警记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CityDetail
