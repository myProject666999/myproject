import React from 'react'
import { Card, Tag, Rate, Avatar, Space } from 'antd'
import { UserOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'

const { Meta } = Card

const CourseCard = ({ course }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course/${course.id}`)
  }

  return (
    <Card
      hoverable
      className="course-card"
      onClick={handleClick}
      cover={
        <div className="course-cover">
          <img
            alt={course.title}
            src={course.cover || 'https://picsum.photos/400/225'}
            className="cover-img"
          />
          <div className="cover-overlay">
            <PlayCircleOutlined style={{ fontSize: 48, color: '#fff' }} />
          </div>
          {course.isFree && <Tag color="green" className="free-tag">免费</Tag>}
          {course.isHot && <Tag color="red" className="hot-tag">热门</Tag>}
        </div>
      }
    >
      <Meta
        title={<div className="course-title">{course.title}</div>}
        description={
          <div className="course-info">
            <Space size={8} className="teacher-info">
              <Avatar size="small" icon={<UserOutlined />} src={course.teacherAvatar} />
              <span className="teacher-name">{course.teacherName}</span>
            </Space>
            <div className="course-meta">
              <Rate disabled allowHalf defaultValue={course.rating || 0} />
              <span className="rating-count">{course.ratingCount || 0}人评价</span>
            </div>
            <div className="course-footer">
              <span className="student-count">{course.studentCount || 0}人学习</span>
              {course.price > 0 ? (
                <span className="course-price">¥{course.price}</span>
              ) : (
                <span className="course-price free">免费</span>
              )}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default CourseCard
