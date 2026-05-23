import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Tag, Button, Space, Input, Select, Pagination, message, Spin } from 'antd'
import { PlayCircleOutlined, StarOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getCourseList, getHotCourses } from '../../api/course'

const { Title, Text } = Typography
const { Option } = Select

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [hotCourses, setHotCourses] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    loadCourses()
    loadHotCourses()
  }, [page])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const res = await getCourseList({ page, page_size: 8, keyword, category })
      setCourses(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const loadHotCourses = async () => {
    try {
      const res = await getHotCourses()
      setHotCourses(res || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadCourses()
  }

  const levelText = ['入门', '初级', '中级', '高级']
  const levelColor = ['green', 'blue', 'orange', 'red']

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40, padding: '60px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12, color: '#fff' }}>
        <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>慕课MOOC在线学习平台</Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>随时随地，学习优质课程</Text>
        <div style={{ marginTop: 24, maxWidth: 600, margin: '24px auto 0' }}>
          <Input.Search
            size="large"
            placeholder="搜索课程..."
            enterButton={<SearchOutlined />}
            onSearch={(value) => { setKeyword(value); handleSearch() }}
          />
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Title level={4} style={{ marginBottom: 16 }}>热门课程</Title>
        </Col>
        {hotCourses.slice(0, 4).map(course => (
          <Col xs={24} sm={12} md={6} key={course.id}>
            <Card
              hoverable
              cover={<div style={{ height: 140, background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayCircleOutlined style={{ fontSize: 48, color: '#fff' }} /></div>}
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <Card.Meta
                title={course.title}
                description={
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" ellipsis={{ rows: 2 }}>{course.description}</Text>
                    <Space>
                      <Tag color={levelColor[course.level]}>{levelText[course.level]}</Tag>
                      <span><StarOutlined style={{ color: '#faad14' }} /> {course.rating_avg}</span>
                    </Space>
                    <Space>
                      <UserOutlined /> {course.student_count}人学习
                    </Space>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={4} style={{ marginBottom: 16 }}>全部课程</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="选择分类"
          style={{ width: 150 }}
          value={category || undefined}
          onChange={(v) => { setCategory(v); setPage(1); loadCourses() }}
          allowClear
        >
          <Option value="1">前端开发</Option>
          <Option value="2">后端开发</Option>
          <Option value="3">移动开发</Option>
          <Option value="4">数据库</Option>
          <Option value="5">运维</Option>
        </Select>
      </Space>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {courses.map(course => (
            <Col xs={24} sm={12} md={6} key={course.id}>
              <Card
                hoverable
                cover={<div style={{ height: 140, background: `linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayCircleOutlined style={{ fontSize: 48, color: '#fff' }} /></div>}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <Card.Meta
                  title={course.title}
                  description={
                    <Space direction="vertical" size={4}>
                      <Tag color={levelColor[course.level]}>{levelText[course.level]}</Tag>
                      <Space>
                        <StarOutlined style={{ color: '#faad14' }} /> {course.rating_avg}
                        <UserOutlined /> {course.student_count}
                      </Space>
                      {course.price > 0 ? (
                        <Text strong style={{ color: '#f5222d' }}>¥{course.price}</Text>
                      ) : (
                        <Tag color="green">免费</Tag>
                      )}
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {total > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Pagination
            current={page}
            total={total}
            pageSize={8}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
