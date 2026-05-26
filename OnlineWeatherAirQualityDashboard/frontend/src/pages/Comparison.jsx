import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Select,
  Space,
  Table,
  Empty,
  Button,
} from 'antd'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { cityAPI, trendAPI, getAQIBadgeClass } from '../services/api.js'
import dayjs from 'dayjs'

function Comparison() {
  const [cities, setCities] = useState([])
  const [selectedCities, setSelectedCities] = useState([])
  const [comparisonData, setComparisonData] = useState([])
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCities()
  }, [])

  const loadCities = async () => {
    try {
      const res = await cityAPI.getAllCities()
      setCities(res.data.data)
      if (res.data.data.length >= 3) {
        setSelectedCities([
          res.data.data[0].id,
          res.data.data[1].id,
          res.data.data[2].id,
        ])
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  }

  useEffect(() => {
    if (selectedCities.length > 0) {
      loadComparison()
    }
  }, [selectedCities, days])

  const loadComparison = async () => {
    if (selectedCities.length === 0) return
    setLoading(true)
    try {
      const res = await trendAPI.getCitiesComparison(selectedCities, days)
      const cityDataMap = res.data.data

      const dateMap = {}
      const cityMap = {}

      cityDataMap.forEach((item) => {
        const cityName = item.city.name
        cityMap[cityName] = true

        item.trends.forEach((trend) => {
          const dateKey = dayjs(trend.trend_date).format('MM-DD')
          if (!dateMap[dateKey]) {
            dateMap[dateKey] = { date: dateKey }
          }
          dateMap[dateKey][cityName] = trend.avg_aqi
        })
      })

      const chartData = Object.keys(dateMap)
        .sort()
        .map((date) => dateMap[date])

      const latestData = cityDataMap.map((item) => {
        const latestTrend = item.trends[item.trends.length - 1]
        const avgTrend =
          item.trends.reduce((sum, t) => sum + t.avg_aqi, 0) /
          (item.trends.length || 1)
        const maxTrend = Math.max(...item.trends.map((t) => t.max_aqi || 0))

        return {
          key: item.city.id,
          city: item.city.name,
          latestAqi: latestTrend?.avg_aqi || 0,
          avgAqi: avgTrend.toFixed(1),
          maxAqi: maxTrend,
          dominantPollutant: latestTrend?.dominant_pollutant || '-',
        }
      })

      setComparisonData({ chartData, tableData: latestData, cityNames: Object.keys(cityMap) })
    } catch (error) {
      console.error('Failed to load comparison:', error)
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

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0', '#00C49F']

  const tableColumns = [
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
    },
    {
      title: '最新AQI',
      dataIndex: 'latestAqi',
      key: 'latestAqi',
      width: 120,
      render: (value) => (
        <span className={getAQIBadgeClass(value)}>{value?.toFixed(0)}</span>
      ),
    },
    {
      title: `近${days}天平均AQI`,
      dataIndex: 'avgAqi',
      key: 'avgAqi',
      width: 140,
    },
    {
      title: `近${days}天最高AQI`,
      dataIndex: 'maxAqi',
      key: 'maxAqi',
      width: 140,
    },
    {
      title: '首要污染物',
      dataIndex: 'dominantPollutant',
      key: 'dominantPollutant',
    },
  ]

  const handleReset = () => {
    if (cities.length >= 3) {
      setSelectedCities([cities[0].id, cities[1].id, cities[2].id])
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <span>选择对比城市:</span>
          <Select
            mode="multiple"
            value={selectedCities}
            onChange={setSelectedCities}
            options={cityOptions}
            style={{ minWidth: 400 }}
            placeholder="请选择要对比的城市"
            maxTagCount={6}
          />
          <span>时间范围:</span>
          <Select
            value={days}
            onChange={setDays}
            options={daysOptions}
            style={{ width: 150 }}
          />
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Card>

      {selectedCities.length > 0 && comparisonData.chartData ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="AQI 趋势对比" loading={loading}>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={comparisonData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparisonData.cityNames?.map((name, index) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="AQI 柱状对比" loading={loading}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {comparisonData.cityNames?.map((name, index) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      fill={colors[index % colors.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="数据对比表" loading={loading}>
              <Table
                columns={tableColumns}
                dataSource={comparisonData.tableData}
                pagination={false}
                bordered
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Empty description="请选择至少一个城市进行对比" />
      )}
    </div>
  )
}

export default Comparison
