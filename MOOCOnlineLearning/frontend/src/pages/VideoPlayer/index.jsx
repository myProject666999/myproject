import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Card, Typography, Button, Space, Progress, List, Input, message, Tag, Empty } from 'antd'
import { PlayCircleOutlined, CheckCircleOutlined, EditOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { getCourseDetail } from '../../api/course'
import { getVideoPlaySign } from '../../api/video'
import { reportProgress, getCourseProgress } from '../../api/course'
import { createNote, getMyNotes } from '../../api/course'

const { Title, Text } = Typography
const { TextArea } = Input

export default function VideoPlayer() {
  const { id } = useParams()
  const videoRef = useRef(null)
  const [course, setCourse] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [progress, setProgress] = useState({})
  const [notes, setNotes] = useState([])
  const [noteModal, setNoteModal] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const progressTimerRef = useRef(null)

  useEffect(() => {
    loadCourseDetail()
    loadProgress()
    loadNotes()
  }, [id])

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [])

  const loadCourseDetail = async () => {
    try {
      const res = await getCourseDetail(id)
      setCourse(res)
      if (res.chapters && res.chapters.length > 0 && res.chapters[0].lessons) {
        setCurrentLesson(res.chapters[0].lessons[0])
      }
    } catch (err) {
      message.error(err.message || '加载失败')
    }
  }

  const loadProgress = async () => {
    try {
      const res = await getCourseProgress(id)
      const progMap = {}
      res.lessons?.forEach(item => {
        progMap[item.lesson_id] = item
      })
      setProgress(progMap)
    } catch (err) {
      console.error(err)
    }
  }

  const loadNotes = async () => {
    try {
      const res = await getMyNotes(id)
      setNotes(res.list || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLessonChange = (lesson) => {
    setCurrentLesson(lesson)
    if (videoRef.current) {
      videoRef.current.currentTime = progress[lesson.id]?.last_position || 0
    }
  }

  const startProgressReport = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }
    progressTimerRef.current = setInterval(async () => {
      if (videoRef.current && currentLesson) {
        try {
          await reportProgress({
            course_id: id,
            lesson_id: currentLesson.id,
            last_position: Math.floor(videoRef.current.currentTime),
            total_watch_time: Math.floor(videoRef.current.currentTime)
          })
        } catch (err) {
          console.error(err)
        }
      }
    }, 30000)
  }

  const handleVideoEnded = async () => {
    if (currentLesson) {
      try {
        await reportProgress({
          course_id: id,
          lesson_id: currentLesson.id,
          progress: 100,
          is_completed: true,
          last_position: currentLesson.duration,
          total_watch_time: currentLesson.duration
        })
        message.success('课程已完成')
        loadProgress()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleAddNote = async () => {
    try {
      await createNote({
        course_id: id,
        lesson_id: currentLesson?.id,
        timestamp: Math.floor(currentTime),
        content: noteContent
      })
      message.success('笔记已保存')
      setNoteModal(false)
      setNoteContent('')
      loadNotes()
    } catch (err) {
      message.error(err.message || '保存失败')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!course) {
    return <Empty description="加载中..." style={{ marginTop: 100 }} />
  }

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              {currentLesson?.video_url ? (
                <video
                  ref={videoRef}
                  src={currentLesson.video_url}
                  controls
                  style={{ width: '100%', maxHeight: 500 }}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={startProgressReport}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <PlayCircleOutlined style={{ fontSize: 64 }} />
                    <Paragraph type="secondary" style={{ marginTop: 16, color: '#fff' }}>
                      {currentLesson?.title || '请选择课时'}
                    </Paragraph>
                  </div>
                </div>
              )}
            </div>

            <Title level={4} style={{ marginBottom: 8 }}>{currentLesson?.title || ''}</Title>
            <Space>
              <Tag color="blue">第{currentLesson?.chapter_index || 1}章</Tag>
              <span><ClockCircleOutlined /> {formatTime(currentLesson?.duration || 0)}</span>
              {progress[currentLesson?.id]?.is_completed && <Tag color="green">已完成</Tag>}
            </Space>
          </Card>

          <Card title="学习笔记">
            <Button type="primary" icon={<EditOutlined />} onClick={() => setNoteModal(true)} style={{ marginBottom: 16 }}>
              添加笔记
            </Button>
            {notes.length > 0 ? (
              <List
                dataSource={notes}
                renderItem={item => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={<Space><Tag color="blue">{formatTime(item.timestamp || 0)}</Tag><Text type="secondary">{item.lesson?.title}</Text></Space>}
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无笔记" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="课程目录" style={{ marginBottom: 16 }}>
            {course.chapters && course.chapters.map((chapter, idx) => (
              <div key={chapter.id} style={{ marginBottom: 16 }}>
                <Space style={{ marginBottom: 8 }}>
                  <Text strong>第{idx + 1}章</Text>
                  <Text>{chapter.title}</Text>
                </Space>
                {chapter.lessons && chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonChange(lesson)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderRadius: 4,
                      background: currentLesson?.id === lesson.id ? '#e6f7ff' : 'transparent',
                      marginLeft: 16
                    }}
                  >
                    <Space>
                      {progress[lesson.id]?.is_completed ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <PlayCircleOutlined />
                      )}
                      <Text>{lesson.title}</Text>
                      {progress[lesson.id]?.progress > 0 && (
                        <Progress percent={progress[lesson.id]?.progress} size="small" style={{ width: 60 }} />
                      )}
                    </Space>
                  </div>
                ))}
              </div>
            ))}
          </Card>

          <Card title="学习进度">
            <Progress
              type="circle"
              percent={progress.course_progress || 0}
              style={{ display: 'block', margin: '0 auto' }}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">已完成 {progress.completed_lessons || 0} / {progress.total_lessons || 0} 课时</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {noteModal && (
        <Modal
          title="添加笔记"
          open={noteModal}
          onOk={handleAddNote}
          onCancel={() => setNoteModal(false)}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">当前时间点：{formatTime(currentTime)}</Text>
          </div>
          <TextArea
            rows={4}
            placeholder="记录你的学习笔记..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </Modal>
      )}
    </div>
  )
}
