import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Spin, Empty } from 'antd'
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined 
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { ticketApi } from '../api/index.js'

function Statistics() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    status: [],
    priority: [],
    date: [],
    agent: []
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statusData, priorityData, dateData, agentData] = await Promise.all([
        ticketApi.getStatusStats(),
        ticketApi.getPriorityStats(),
        ticketApi.getDateStats(),
        ticketApi.getAgentStats()
      ])

      setStats({
        status: statusData || [],
        priority: priorityData || [],
        date: dateData || [],
        agent: agentData || []
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusChartOption = () => {
    const statusMap = {
      PENDING: '待处理',
      ASSIGNED: '已分配',
      PROCESSING: '处理中',
      RESOLVED: '已解决',
      CLOSED: '已关闭',
      REJECTED: '已拒绝'
    }

    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: stats.status.map(item => ({
          name: statusMap[item.status] || item.status,
          value: item.count
        }))
      }]
    }
  }

  const getPriorityChartOption = () => {
    const priorityMap = {
      LOW: '低',
      MEDIUM: '中',
      HIGH: '高',
      URGENT: '紧急'
    }

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: stats.priority.map(item => priorityMap[item.priority] || item.priority) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: stats.priority.map(item => item.count),
        itemStyle: {
          color: (params) => {
            const colors = ['#52c41a', '#1890ff', '#fa8c16', '#ff4d4f']
            return colors[params.dataIndex] || '#1890ff'
          }
        }
      }]
    }
  }

  const getDateChartOption = () => ({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: stats.date.map(item => item.date?.toString().slice(5) || '')
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      data: stats.date.map(item => item.count),
      smooth: true,
      itemStyle: { color: '#1890ff' }
    }]
  })

  const getAgentChartOption = () => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: stats.agent.map(item => item.agent_name || '未知') },
    series: [{
      type: 'bar',
      data: stats.agent.map(item => item.count),
      itemStyle: { color: '#722ed1' }
    }]
  })

  const totalTickets = stats.status.reduce((sum, item) => sum + (item.count || 0), 0)
  const resolvedCount = stats.status.find(item => item.status === 'RESOLVED')?.count || 0
  const pendingCount = stats.status.find(item => item.status === 'PENDING')?.count || 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">统计报表</h1>
      </div>

      <Row gutter={[16, 16]} className="workbench-stats">
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card className="stat-card">
            <Statistic
              title="工单总数"
              value={totalTickets}
              prefix={<FileTextOutlined style={{ fontSize: 20 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card className="stat-card">
            <Statistic
              title="已解决"
              value={resolvedCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card className="stat-card">
            <Statistic
              title="待处理"
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card className="stat-card">
            <Statistic
              title="客服数量"
              value={stats.agent.length}
              prefix={<WarningOutlined style={{ color: '#722ed1', fontSize: 20 }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="工单状态分布" style={{ marginBottom: 16 }}>
              {stats.status.length > 0 ? (
                <div className="chart-container">
                  <ReactECharts option={getStatusChartOption()} style={{ height: '100%', width: '100%' }} />
                </div>
              ) : <Empty style={{ padding: '40px 0' }} />}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="工单优先级分布" style={{ marginBottom: 16 }}>
              {stats.priority.length > 0 ? (
                <div className="chart-container">
                  <ReactECharts option={getPriorityChartOption()} style={{ height: '100%', width: '100%' }} />
                </div>
              ) : <Empty style={{ padding: '40px 0' }} />}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="近30天工单趋势" style={{ marginBottom: 16 }}>
              {stats.date.length > 0 ? (
                <div className="chart-container">
                  <ReactECharts option={getDateChartOption()} style={{ height: '100%', width: '100%' }} />
                </div>
              ) : <Empty style={{ padding: '40px 0' }} />}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="客服工单统计" style={{ marginBottom: 16 }}>
              {stats.agent.length > 0 ? (
                <div className="chart-container">
                  <ReactECharts option={getAgentChartOption()} style={{ height: '100%', width: '100%' }} />
                </div>
              ) : <Empty style={{ padding: '40px 0' }} />}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Statistics