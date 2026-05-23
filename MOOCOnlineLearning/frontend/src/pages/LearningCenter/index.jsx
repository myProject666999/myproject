import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Tag, Tabs, List, Progress, Empty, Button, Space, Statistic } from 'antd'
import { PlayCircleOutlined, CheckCircleOutlined, TrophyOutlined, StarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getMyCourses, getMyScores, getMyCertificates } from '../../api/user'

const { Title, Text } = Typography

export default function LearningCenter() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [scores, setScores] = useState([])
  const [certificates, setCertificates] = useState([])
  const [stats, setStats] = useState({ learning: 0, completed: 0, certificates: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesRes, scoresRes, certsRes] = await Promise.all([
        getMyCourses({ page: 1, page_size: 50 }),
        getMyScores(),
        getMyCertificates()
      ])
      setCourses(coursesRes.list || [])
      setScores(scoresRes || [])
      setCertificates(certsRes || [])
      const completed = (coursesRes.list || []).filter(c => c.progress === 100).length
      setStats({
        learning: (coursesRes.list || []).filter(c => c.progress > 0 && c.progress < 100).length,
        completed,
        certificates: (certsRes || []).length
      })
    } catch (err) {
      console.error(err)
    }
  }

  const renderCourseList = (filter) => {
    const filtered = courses.filter(c => {
      if (filter === 'learning') return c.progress > 0 && c.progress < 100
      if (filter === 'completed') return c.progress === 100
      return true
    })

    if (filtered.length === 0) {
      return <Empty description="暂无课程" />
    }

    return (
      <Row gutter={[16, 16]}>
        {filtered.map(course => (
          <Col xs={24} sm={12} md={8} key={course.id}>
            <Card
              hoverable
              onClick={() => navigate(`/learn/${course.id}`)}
              cover={<div style={{ height: 120, background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayCircleOutlined style={{ fontSize: 40, color: '#fff' }} /></div>}
            >
              <Card.Meta
                title={course.title}
                description={
                  <Space direction="vertical" size={8}>
                    <Progress percent={course.progress || 0} size="small" />
                    {course.progress === 100 && <Tag color="green">已完成</Tag>}
                    {course.last_watch_at && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        上次学习：{course.last_watch_at}
                      </Text>
                    )}
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>我的学习中心</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="正在学习"
              value={stats.learning}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="获得证书"
              value={stats.certificates}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          items={[
            {
              key: 'learning',
              label: '正在学习',
              children: renderCourseList('learning')
            },
            {
              key: 'completed',
              label: '已完成',
              children: renderCourseList('completed')
            },
            {
              key: 'all',
              label: '全部课程',
              children: renderCourseList('all')
            },
            {
              key: 'scores',
              label: '测验成绩',
              children: scores.length > 0 ? (
                <List
                  dataSource={scores}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        title={item.course_name}
                        description={
                          <Space>
                            <Tag color={item.is_passed ? 'green' : 'red'}>
                              {item.is_passed ? '通过' : '未通过'}
                            </Tag>
                            <Text>得分：{item.total_score}</Text>
                            <Text type="secondary">{item.submitted_at}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : <Empty description="暂无成绩" />
            },
            {
              key: 'certificates',
              label: '我的证书',
              children: certificates.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {certificates.map(cert => (
                    <Col xs={24} sm={12} md={8} key={cert.id}>
                      <Card
                        hoverable
                        cover={<div style={{ height: 180, background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff' }}>
                          <TrophyOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                          <Text strong style={{ color: '#fff' }}>{cert.title}</Text>
                        </div>}
                      >
                        <Card.Meta
                          title={cert.course_name}
                          description={
                            <Space direction="vertical">
                              <Text type="secondary">证书编号：{cert.certificate_no}</Text>
                              <Text type="secondary">颁发日期：{cert.issued_at}</Text>
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : <Empty description="暂无证书" />
            }
          ]}
        />
      </Card>
    </div>
  )
}
