import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Radio, Checkbox, Progress, Space, Result, message, Spin } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuizQuestions, submitQuiz } from '../../api/quiz'

const { Title, Text } = Typography

export default function Quiz() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    loadQuestions()
  }, [courseId, lessonId])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await getQuizQuestions(courseId)
      setQuestions(res || [])
    } catch (err) {
      message.error(err.message || '加载题目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, value, isMulti = false) => {
    if (isMulti) {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
    }
  }

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      message.warning(`还有 ${unanswered.length} 道题未作答`)
      return
    }

    setLoading(true)
    try {
      const answerList = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        user_answer: Array.isArray(answer) ? answer.join(',') : answer
      }))

      const res = await submitQuiz({
        course_id: courseId,
        lesson_id: lessonId,
        answers: answerList
      })
      setResult(res)
      setSubmitted(true)
    } catch (err) {
      message.error(err.message || '提交失败')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    }
  }

  if (loading && questions.length === 0) {
    return <Spin style={{ display: 'block', margin: '100px auto' }} />
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Card>
          <Result
            status="info"
            title="暂无测验"
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>返回</Button>
            }
          />
        </Card>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Result
            status={result.is_passed ? 'success' : 'warning'}
            title={result.is_passed ? '恭喜通过测验！' : '很遗憾，未通过测验'}
            subTitle={`得分：${result.total_score} / ${result.total_questions * 10} (${((result.total_score / (result.total_questions * 10)) * 100).toFixed(0)}%)`}
            extra={[
              <Button type="primary" key="retry" onClick={() => {
                setSubmitted(false)
                setResult(null)
                setAnswers({})
                setCurrentIdx(0)
              }}>再试一次</Button>,
              <Button key="back" onClick={() => navigate(-1)}>返回课程</Button>
            ]}
          />
          <div style={{ marginTop: 24 }}>
            <Title level={5}>答题详情</Title>
            {questions.map((q, idx) => {
              const userAnswer = Array.isArray(answers[q.id]) ? answers[q.id].join(',') : answers[q.id]
              const correctOption = q.options?.find(o => o.is_correct)
              const isCorrect = userAnswer === correctOption?.option_label
              return (
                <Card key={q.id} size="small" style={{ marginBottom: 8 }}>
                  <Space>
                    <Text strong>{idx + 1}.</Text>
                    <Text>{q.content}</Text>
                    {isCorrect ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                  </Space>
                  <div style={{ marginTop: 8, paddingLeft: 24 }}>
                    <Text type="secondary">你的答案：{userAnswer}</Text>
                    {!isCorrect && (
                      <Text type="secondary" style={{ marginLeft: 16 }}>
                        正确答案：{correctOption?.option_label}
                      </Text>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentIdx]

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          章节测验 ({currentIdx + 1} / {questions.length})
        </Title>

        <Progress
          percent={Math.round(((currentIdx + 1) / questions.length) * 100)}
          style={{ marginBottom: 32 }}
        />

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 16 }}>
            {currentIdx + 1}. {currentQ.content}
          </Text>
          <Tag style={{ marginLeft: 8 }}>
            {currentQ.question_type === 1 ? '单选题' : currentQ.question_type === 2 ? '多选题' : '判断题'}
          </Tag>
        </div>

        <div style={{ marginBottom: 32, paddingLeft: 16 }}>
          {currentQ.question_type === 1 && (
            <Radio.Group
              value={answers[currentQ.id]}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
            >
              <Space direction="vertical">
                {currentQ.options?.map(opt => (
                  <Radio key={opt.id} value={opt.option_label}>
                    {opt.option_label}. {opt.option_content}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}

          {currentQ.question_type === 2 && (
            <Checkbox.Group
              value={answers[currentQ.id] || []}
              onChange={(vals) => handleAnswer(currentQ.id, vals, true)}
            >
              <Space direction="vertical">
                {currentQ.options?.map(opt => (
                  <Checkbox key={opt.id} value={opt.option_label}>
                    {opt.option_label}. {opt.option_content}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}

          {currentQ.question_type === 3 && (
            <Radio.Group
              value={answers[currentQ.id]}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
            >
              <Space>
                <Radio value="T">正确</Radio>
                <Radio value="F">错误</Radio>
              </Space>
            </Radio.Group>
          )}
        </div>

        <Space>
          {currentIdx > 0 && (
            <Button onClick={handlePrev}>上一题</Button>
          )}
          {currentIdx < questions.length - 1 && (
            <Button type="primary" onClick={handleNext}>下一题</Button>
          )}
          {currentIdx === questions.length - 1 && (
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              提交测验
            </Button>
          )}
        </Space>
      </Card>
    </div>
  )
}
