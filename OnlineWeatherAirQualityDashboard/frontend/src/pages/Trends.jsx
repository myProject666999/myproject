import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  Space,
  Empty,
} from 'antd'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { cityAPI, trendAPI } from '../services/api.js'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

function Trends() {
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [trends, setTrends] = useState([])
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCities()
  }, [])

  useEffect(() => {
    if (selectedCity) {
      loadTrends()
    }
  }, [selectedCity, days])

  const loadCities = async () => {
    try {
      const res = await cityAPI.getAllCities()
      setCities(res.data.data)
      if (res.data.data.length > 0) {
        setSelectedCity(res.data.data[0].id)
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  }

  const loadTrends = async () => {
    if (!selectedCity) return
    setLoading(true)
    try {
      const res = await trendAPI.getCityTrend(selectedCity, days)
      const data = res.data.data.map((item) => ({
        ...item,
        date: dayjs(item.trend_date).format('MM-DD'),
      }))
      setTrends(data)
    } catch (error) {
      console.error('Failed to load trends:', error)
    } finally {
      setLoading(false)
    }
  }

  const cityOptions = cities.map((city) => ({
    label: city.name,
    value: city.id,
  }))

  const daysOptions = [
    { label: '近7天', value: 7 },
    { label: '近14天', value: 14 },
    { label: '近30天', value: 30 },
  ]

  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <span>选择城市:</span>
          <Select
            value={selectedCity}
            onChange={setSelectedCity}
            options={cityOptions}
            style={{ width: 200 }}
            placeholder="请选择城市"
          />
          <span>时间范围:</span>
          <Select
            value={days}
            onChange={setDays}
            options={daysOptions}
            style={{ width: 150 }}
          />
        </Space>
      </Card>

      {trends.length > 0 ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="AQI 趋势" loading={loading}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="avg_aqi"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorAqi)"
                    name="平均AQI"
                  />
                  <Line
                    type="monotone"
                    dataKey="max_aqi"
                    stroke="#ff7300"
                    name="最高AQI"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="min_aqi"
                    stroke="#82ca9d"
                    name="最低AQI"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="PM2.5 趋势" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg_pm25"
                    stroke="#ff4d4f"
                    name="平均PM2.5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="O₃ 趋势" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg_o3"
                    stroke="#1890ff"
                    name="平均O₃"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="PM10 趋势" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg_pm10"
                    stroke="#fa8c16"
                    name="平均PM10"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="NO₂ / SO₂ / CO 趋势" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg_no2"
                    stroke="#722ed1"
                    name="平均NO₂"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_so2"
                    stroke="#13c2c2"
                    name="平均SO₂"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_co"
                    stroke="#a0d911"
                    name="平均CO"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      ) : (
        <Empty description="请选择城市查看趋势数据" />
      )}
    </div>
  )
}

export default Trends
