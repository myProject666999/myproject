import { Card, Form, Select, Button, Table } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'
import ReactECharts from 'echarts-for-react'

const Statistics = () => {
  const [roomTypes, setRoomTypes] = useState([])
  const [statistics, setStatistics] = useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadRoomTypes()
    loadStatistics({ year: new Date().getFullYear() })
  }, [])

  const loadRoomTypes = async () => {
    try {
      const res = await API.getAdminRoomTypes()
      setRoomTypes(res.data)
    } catch (e) {}
  }

  const loadStatistics = async params => {
    try {
      const res = await API.getStatistics(params)
      setStatistics(res.data)
    } catch (e) {}
  }

  const onFinish = values => {
    loadStatistics(values)
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const countData = new Array(12).fill(0)
  const revenueData = new Array(12).fill(0)

  if (statistics && statistics.length > 0) {
    statistics.forEach(item => {
      if (item && item.month) {
        countData[item.month - 1] = item.count || 0
        revenueData[item.month - 1] = item.revenue || 0
      }
    })
  }

  const countOption = {
    title: { text: '订单数量统计' },
    tooltip: {},
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ data: countData, type: 'bar' }]
  }

  const revenueOption = {
    title: { text: '营收统计 (元)' },
    tooltip: {},
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{ data: revenueData, type: 'line' }]
  }

  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i)
  }

  const columns = [
    { title: '月份', dataIndex: 'month', key: 'month', render: m => `${m}月` },
    { title: '订单数', dataIndex: 'count', key: 'count' },
    { title: '营收', dataIndex: 'revenue', key: 'revenue', render: r => `¥${r}` }
  ]

  return (
    <div>
      <h2>统计分析</h2>
      <Card>
        <Form form={form} layout="inline" onFinish={onFinish} initialValues={{ year: currentYear }}>
          <Form.Item name="year" label="年份" rules={[{ required: true }]}>
            <Select style={{ width: 150 }}>
              {years.map(y => (
                <Select.Option key={y} value={y}>{y}年</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="roomTypeId" label="房型">
            <Select placeholder="全部房型" style={{ width: 200 }} allowClear>
              {roomTypes.map(rt => (
                <Select.Option key={rt.id} value={rt.id}>{rt.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
          </Form.Item>
        </Form>

        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <Card style={{ flex: 1 }}>
            <ReactECharts option={countOption} style={{ height: 300 }} />
          </Card>
          <Card style={{ flex: 1 }}>
            <ReactECharts option={revenueOption} style={{ height: 300 }} />
          </Card>
        </div>

        <Card style={{ marginTop: 16 }}>
          <Table columns={columns} dataSource={statistics} rowKey="month" pagination={false} />
        </Card>
      </Card>
    </div>
  )
}

export default Statistics
