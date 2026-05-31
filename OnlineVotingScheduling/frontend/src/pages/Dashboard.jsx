import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, List, Tag, Typography, DatePicker, Spin } from 'antd'
import { CalendarOutlined, TeamOutlined, SwapOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { scheduleSlotApi, shiftSwapApi, teamApi } from '../api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function Dashboard() {
  const [stats, setStats] = useState({ mySlots: 0, pendingSwaps: 0, myTeams: 0 })
  const [upcomingSlots, setUpcomingSlots] = useState([])
  const [recentSwaps, setRecentSwaps] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const start = dayjs().format('YYYY-MM-DD')
      const end = dayjs().add(30, 'day').format('YYYY-MM-DD')
      const [slotsRes, swapsRes, teamsRes] = await Promise.all([
        scheduleSlotApi.getMySlots(start, end),
        shiftSwapApi.getMySwaps(),
        teamApi.getMyTeams()
      ])
      setStats({
        mySlots: slotsRes.data?.length || 0,
        pendingSwaps: (swapsRes.data || []).filter(s => s.status === 'PENDING').length,
        myTeams: teamsRes.data?.length || 0
      })
      setUpcomingSlots(slotsRes.data?.slice(0, 5) || [])
      setRecentSwaps(swapsRes.data?.slice(0, 5) || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  return (
    <div>
      <Title level={4} className="page-title">仪表盘</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="我的值班(未来30天)"
              value={stats.mySlots}
              prefix={<CalendarOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="待处理调班"
              value={stats.pendingSwaps}
              prefix={<SwapOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="我的团队"
              value={stats.myTeams}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="我的近期值班" extra={<ClockCircleOutlined />}>
            <List
              dataSource={upcomingSlots}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={dayjs(item.date).format('YYYY-MM-DD')}
                    description={`${item.startTime?.substring(0, 5)} - ${item.endTime?.substring(0, 5)}`}
                  />
                  <Tag color={item.status === 'ASSIGNED' ? 'blue' : 'orange'}>
                    {item.status === 'ASSIGNED' ? '已分配' : item.status === 'SWAP_PENDING' ? '调班中' : '已完成'}
                  </Tag>
                </List.Item>
              )}
              locale={{ emptyText: '暂无值班安排' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近调班记录" extra={<SwapOutlined />}>
            <List
              dataSource={recentSwaps}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    title={`调班申请 #${item.id}`}
                    description={item.reason}
                  />
                  <Tag color={
                    item.status === 'PENDING' ? 'orange' :
                    item.status === 'APPROVED' ? 'green' :
                    item.status === 'REJECTED' ? 'red' : 'default'
                  }>
                    {item.status === 'PENDING' ? '待审批' :
                     item.status === 'APPROVED' ? '已通过' :
                     item.status === 'REJECTED' ? '已拒绝' : '已取消'}
                  </Tag>
                </List.Item>
              )}
              locale={{ emptyText: '暂无调班记录' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
