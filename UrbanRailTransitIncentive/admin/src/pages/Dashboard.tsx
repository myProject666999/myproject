import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, message } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import { userApi, taskApi, taskResultApi, publisherApi } from '../api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    taskCount: 0,
    resultCount: 0,
    publisherCount: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [userRes, taskRes, resultRes, publisherRes] = await Promise.all([
        userApi.getList({ page: 1, page_size: 1 }),
        taskApi.getList({ page: 1, page_size: 1 }),
        taskResultApi.getList({ page: 1, page_size: 1 }),
        publisherApi.getList({ page: 1, page_size: 1 })
      ])

      setStats({
        userCount: userRes.data?.total || 0,
        taskCount: taskRes.data?.total || 0,
        resultCount: resultRes.data?.total || 0,
        publisherCount: publisherRes.data?.total || 0
      })
    } catch (error) {
      message.error('加载统计数据失败')
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.userCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务总数"
              value={stats.taskCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成结果"
              value={stats.resultCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="发布者"
              value={stats.publisherCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
