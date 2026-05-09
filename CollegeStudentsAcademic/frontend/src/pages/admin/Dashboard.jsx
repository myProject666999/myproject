import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { TeamOutlined, ShopOutlined, CalendarOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

function Dashboard() {
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats()
      setStats(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.student_count || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ color: '#999', marginTop: 8 }}>
              待审核: <span style={{ color: '#faad14' }}>{stats.pending_students || 0}</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="服务总数"
              value={stats.service_count || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预约总数"
              value={stats.appointment_count || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ color: '#999', marginTop: 8 }}>
              待确认: <span style={{ color: '#faad14' }}>{stats.pending_appointments || 0}</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="留言总数"
              value={stats.message_count || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <div style={{ color: '#999', marginTop: 8 }}>
              待回复: <span style={{ color: '#faad14' }}>{stats.pending_messages || 0}</span>
            </div>
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <h3>系统说明</h3>
        <ul style={{ lineHeight: 2.5, color: '#666' }}>
          <li>管理员可以管理系统用户、学生信息、服务项目、预约信息、知识文章和留言</li>
          <li>学生注册后需要管理员审核才能登录</li>
          <li>学生可以浏览服务信息、学业规划知识，并进行服务预约和在线留言</li>
        </ul>
      </Card>
    </div>
  )
}

export default Dashboard
