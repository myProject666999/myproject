import React, { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Modal,
  Spin,
  message,
  Descriptions
} from 'antd'
import {
  EnvironmentOutlined,
  BankOutlined,
  HeartOutlined,
  HeartFilled,
  SendOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import request from '../utils/request.js'

const { Title, Paragraph, Text } = Typography

const JobDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [job, setJob] = useState(null)
  const [company, setCompany] = useState(null)
  const [favorited, setFavorited] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  const isJobSeeker = currentUser?.role === 'JOB_SEEKER'

  useEffect(() => {
    if (id) fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const data = await request.get(`/jobs/${id}`)
      setJob(data?.job || data)
      setCompany(data?.company || data?.companyInfo || null)
    } catch (err) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!isJobSeeker) {
      message.warning('仅求职者可投递')
      return
    }
    Modal.confirm({
      title: '确认投递',
      content: `确认向「${job?.title}」投递简历吗？`,
      okText: '确认投递',
      cancelText: '取消',
      onOk: async () => {
        setApplyLoading(true)
        try {
          await request.post('/applications', { jobId: job.id })
          message.success('投递成功')
        } finally {
          setApplyLoading(false)
        }
      }
    })
  }

  const handleFavorite = async () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    setFavoriteLoading(true)
    try {
      if (favorited) {
        await request.delete(`/jobs/favorites/${job.id}`)
        setFavorited(false)
        message.success('已取消收藏')
      } else {
        await request.post('/jobs/favorites', { jobId: job.id })
        setFavorited(true)
        message.success('已收藏')
      }
    } finally {
      setFavoriteLoading(false)
    }
  }

  const renderSalary = () => {
    if (!job) return ''
    if (job.minSalary && job.maxSalary) return `${job.minSalary}-${job.maxSalary}K`
    if (job.minSalary) return `${job.minSalary}K以上`
    return '面议'
  }

  const benefits = (job?.benefits || '')
    .split(/[,，、;；\s]+/)
    .filter(Boolean)

  return (
    <div className="page-container">
      <Spin spinning={loading}>
        {job ? (
          <>
            <Card style={{ borderRadius: 12, marginBottom: 16 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space align="center" size={12}>
                    <Title level={3} style={{ margin: 0 }}>
                      {job.title}
                    </Title>
                    <Text className="salary-text" style={{ fontSize: 22 }}>
                      {renderSalary()}
                    </Text>
                  </Space>
                  <Space wrap size={[8, 8]} style={{ marginTop: 12 }}>
                    {job.city && (
                      <Tag color="blue">
                        <EnvironmentOutlined /> {job.city}
                      </Tag>
                    )}
                    {job.experience && <Tag>{job.experience}</Tag>}
                    {job.education && <Tag>{job.education}</Tag>}
                    {job.jobType && <Tag color="purple">{job.jobType}</Tag>}
                    {job.createdAt && (
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        发布于 {job.createdAt}
                      </Tag>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    {isJobSeeker && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        loading={applyLoading}
                        onClick={handleApply}
                      >
                        立即投递
                      </Button>
                    )}
                    <Button
                      size="large"
                      icon={favorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                      loading={favoriteLoading}
                      onClick={handleFavorite}
                    >
                      {favorited ? '已收藏' : '收藏'}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Card title="职位描述" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {job.description || '暂无职位描述'}
                  </Paragraph>
                </Card>

                <Card title="任职要求" style={{ borderRadius: 12, marginBottom: 16 }}>
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {job.requirements || '暂无任职要求'}
                  </Paragraph>
                </Card>

                {benefits.length > 0 && (
                  <Card title="福利待遇" style={{ borderRadius: 12 }}>
                    <Space wrap size={[8, 8]}>
                      {benefits.map((b, idx) => (
                        <Tag key={idx} color="green" style={{ padding: '4px 12px' }}>
                          {b}
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                )}
              </Col>

              <Col xs={24} md={8}>
                <Card
                  style={{ borderRadius: 12, position: 'sticky', top: 16 }}
                  title={<span><BankOutlined /> 公司信息</span>}
                >
                  {company ? (
                    <>
                      <Row gutter={12} align="middle" style={{ marginBottom: 12 }}>
                        <Col flex="64px">
                          <img
                            src={company.logo || 'https://via.placeholder.com/64'}
                            alt="logo"
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                          />
                        </Col>
                        <Col flex="auto">
                          <Title level={5} style={{ margin: 0 }}>
                            {company.name}
                          </Title>
                          <Space size={8} wrap>
                            {company.industry && <Tag>{company.industry}</Tag>}
                            {company.scale && <Tag color="blue">{company.scale}</Tag>}
                          </Space>
                        </Col>
                      </Row>
                      <Divider style={{ margin: '12px 0' }} />
                      <Descriptions column={1} size="small">
                        {company.industry && (
                          <Descriptions.Item label="行业">{company.industry}</Descriptions.Item>
                        )}
                        {company.scale && (
                          <Descriptions.Item label="规模">{company.scale}</Descriptions.Item>
                        )}
                        {company.address && (
                          <Descriptions.Item label="地址">{company.address}</Descriptions.Item>
                        )}
                        {company.website && (
                          <Descriptions.Item label="官网">{company.website}</Descriptions.Item>
                        )}
                      </Descriptions>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary">公司简介</Text>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        {company.description || '暂无公司简介'}
                      </Paragraph>
                    </>
                  ) : (
                    <Empty description="暂无公司信息" />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          !loading && <Card style={{ borderRadius: 12 }}>职位不存在或已删除</Card>
        )}
      </Spin>
    </div>
  )
}

export default JobDetailPage
