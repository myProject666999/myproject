import React, { useEffect, useState } from 'react'
import { Card, Typography, Button, Radio, Modal, message, Steps, Empty } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { getPaperDetail, getPaperQuestions, startExam, submitExam } from '../utils/api'

const { Title, Paragraph } = Typography

const Exam = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paper, setPaper] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [recordId, setRecordId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    loadData()
  }, [])

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, submitted])

  const loadData = async () => {
    try {
      const [paperRes, questionsRes, startRes] = await Promise.all([
        getPaperDetail(id),
        getPaperQuestions(id),
        startExam(id)
      ])
      
      setPaper(paperRes.data)
      setQuestions(questionsRes.data || [])
      setTimeLeft(paperRes.data.duration * 60)
      setRecordId(startRes.data.record_id)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (submitted) return
    
    Modal.confirm({
      title: '确认提交',
      content: `还有 ${formatTime(timeLeft)}，确定要提交试卷吗？`,
      onOk: async () => {
        try {
          setSubmitted(true)
          const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
            question_id: parseInt(questionId),
            answer
          }))
          
          const res = await submitExam(recordId, { answers: answersArray })
          setResult(res.data)
          message.success(res.data.is_pass === 1 ? '恭喜，考试通过！' : '考试未通过，继续加油！')
        } catch (error) {
          console.error('Submit error:', error)
        }
      }
    })
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex]

  if (result) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: result.is_pass === 1 ? '#52c41a' : '#ff4d4f' }}>
              {result.is_pass === 1 ? '🎉 考试通过！' : '😢 考试未通过'}
            </Title>
            <div style={{ fontSize: 48, margin: '20px 0' }}>
              <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{result.score}</span>
              <span style={{ fontSize: 24, color: '#999' }}> / {result.total_score}</span>
            </div>
            <Button type="primary" size="large" onClick={() => navigate('/my/exam-records')}>
              查看考试记录
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return <Empty description="试卷暂无试题" />
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40 }}>
      <div className="exam-timer">
        ⏱ {formatTime(timeLeft)}
      </div>
      
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>{paper?.title}</Title>
        
        <Steps 
          current={currentIndex} 
          items={questions.map((_, index) => ({
            title: answers[_.id] ? '✓' : index + 1
          }))}
          style={{ marginBottom: 32 }}
        />
        
        <div style={{ minHeight: 400 }}>
          <Title level={4}>
            第 {currentIndex + 1} 题：{currentQuestion?.content}
          </Title>
          
          {currentQuestion?.options && currentQuestion.options.length > 0 ? (
            <Radio.Group
              value={answers[currentQuestion?.id]}
              onChange={(e) => handleAnswerChange(currentQuestion?.id, e.target.value)}
              style={{ display: 'block' }}
            >
              {currentQuestion.options.map(option => (
                <Radio 
                  key={option.id} 
                  value={option.option_key}
                  style={{ display: 'block', marginBottom: 16, fontSize: 16 }}
                >
                  {option.option_key}. {option.option_text}
                </Radio>
              ))}
            </Radio.Group>
          ) : (
            <Paragraph type="secondary">暂无选项</Paragraph>
          )}
        </div>
        
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
          >
            上一题
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button type="primary" onClick={handleSubmit}>
              提交试卷
            </Button>
          ) : (
            <Button 
              type="primary"
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              下一题
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Exam
