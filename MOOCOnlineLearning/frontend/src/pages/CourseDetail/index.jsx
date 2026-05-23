import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Tag, Button, Space, Avatar, Rate, List, Input, message, Spin, Modal } from 'antd'
import { PlayCircleOutlined, StarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourseDetail } from '../../api/course'
import { getCourseReviews, createReview } from '../../api/course'
import { enrollCourse } from '../../api/course'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })

  useEffect(() => {
    loadCourseDetail()
    loadReviews()
  }, [id])

  const loadCourseDetail = async () => {
    setLoading(true)
    try {
      const res = await getCourseDetail(id)
      setCourse(res)
    } catch (err) {
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const res = await getCourseReviews(id)
      setReviews(res.list || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleEnroll = async () => {
    try {
      await enrollCourse(id)
      message.success('选课成功')
      navigate(`/learn/${id}`)
    } catch (err) {
      message.error(err.message || '选课失败')
    }
  }

  const handleSubmitReview = async () => {
    try {
      await createReview({ course_id: id, ...reviewForm })
      message.success('评论成功')
      setReviewModal(false)
      loadReviews()
    } catch (err) {
      message.error(err.message || '评论失败')
    }
  }

  if (loading || !course) {
    return <Spin style={{ display: 'block', margin: '100px auto' }} />
  }

  const levelText = ['入门', '初级', '中级', '高级']
  const levelColor = ['green', 'blue', 'orange', 'red']

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card>
            <div style={{ height: 300, background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <PlayCircleOutlined style={{ fontSize: 80, color: '#fff' }} />
            </div>
            <Title level={3} style={{ marginBottom: 16 }}>{course.title}</Title>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={levelColor[course.level]}>{levelText[course.level]}</Tag>
              <Tag color="blue">{course.category_name}</Tag>
              <span><StarOutlined style={{ color: '#faad14' }} /> {course.rating_avg}</span>
              <span><UserOutlined /> {course.student_count}人学习</span>
              <span><ClockCircleOutlined /> {Math.floor(course.duration / 3600)}小时</span>
            </Space>
            <Paragraph type="secondary">{course.description}</Paragraph>

            <Title level={4} style={{ marginTop: 32 }}>课程目录</Title>
            {course.chapters && course.chapters.map((chapter, idx) => (
              <Card key={chapter.id} size="small" style={{ marginBottom: 8 }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text strong>第{idx + 1}章 {chapter.title}</Text>
                </Space>
                {chapter.lessons && chapter.lessons.map((lesson, lIdx) => (
                  <div key={lesson.id} style={{ paddingLeft: 32, marginTop: 8 }}>
                    <Space>
                      {lesson.lesson_type === 1 ? <PlayCircleOutlined /> : <CheckCircleOutlined />}
                      <Text>{lesson.title}</Text>
                      {lesson.is_free && <Tag color="green">免费</Tag>}
                    </Space>
                  </div>
                ))}
              </Card>
            ))}
          </Card>

          <Card style={{ marginTop: 24 }} title="课程评价">
            <Button type="primary" onClick={() => setReviewModal(true)} style={{ marginBottom: 16 }}>发表评价</Button>
            <List
              dataSource={reviews}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={<Space><Text strong>{item.user?.nickname || '用户'}</Text><Rate disabled value={item.rating} /></Space>}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Title level={4} style={{ color: '#f5222d', margin: 0 }}>
                {course.price > 0 ? `¥${course.price}` : '免费'}
              </Title>
              <Button type="primary" size="large" block onClick={handleEnroll}>
                立即学习
              </Button>
              <Button size="large" block>加入购物车</Button>
            </Space>
          </Card>

          <Card style={{ marginTop: 16 }} title="讲师信息">
            <Space>
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <Text strong>{course.teacher?.nickname || '讲师'}</Text>
                <Paragraph type="secondary" style={{ margin: 0 }}>{course.teacher?.title || ''}</Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title="发表评价"
        open={reviewModal}
        onOk={handleSubmitReview}
        onCancel={() => setReviewModal(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>评分：</Text>
          <Rate value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
        </div>
        <TextArea
          rows={4}
          placeholder="说说你的学习感受..."
          value={reviewForm.content}
          onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
        />
      </Modal>
    </div>
  )
}
