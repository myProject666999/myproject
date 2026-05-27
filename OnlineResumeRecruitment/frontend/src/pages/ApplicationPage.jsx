import React, { useEffect, useState } from 'react'
import {
  Card,
  List,
  Tag,
  Row,
  Col,
  Typography,
  Select,
  Empty,
  Spin,
  Space,
  Button,
  Divider,
  Descriptions,
  Modal
} from 'antd'
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  MessageOutlined
} from '@ant-design/icons'
import request from '../utils/request'

const { Title, Text, Paragraph } = Typography

const STATUS_MAP = {
  PENDING: { label: '待查看', color: 'default' },
  VIEWED: { label: '已查看', color: 'processing' },
  PASSED: { label: '初筛通过', color: 'success' },
  INTERVIEW: { label: '面试中', color: 'warning' },
  OFFER: { label: '已发Offer', color: 'purple' },
  REJECTED: { label: '已拒绝', color: 'error' },
  HIRED: { label: '已录用', color: 'gold' }
}

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '待查看', value: 'PENDING' },
  { label: '已查看', value: 'VIEWED' },
  { label: '初筛通过', value: 'PASSED' },
  { label: '面试中', value: 'INTERVIEW' },
  { label: '已发Offer', value: 'OFFER' },
  { label: '已拒绝', value: 'REJECTED' },
  { label: '已录用', value: 'HIRED' }
]

const ApplicationPage = () => {
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const data = await request.get('/applications/my', { params })
      setApplications(Array.isArray(data) ? data : data?.records || data?.list || [])
    } catch (err) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleStatusColor = (status) => STATUS_MAP[status]?.color || 'default'
  const handleStatusLabel = (status) => STATUS_MAP[status]?.label || status

  const renderItem = (app) => {
    const expanded = expandedId === app.id
    const salary =
      app.minSalary && app.maxSalary
        ? `${app.minSalary}-${app.maxSalary}K`
        : app.minSalary
          ? `${app.minSalary}K以上`
          : '面议'

    return (
      <Card
        key={app.id}
        hoverable
        style={{ marginBottom: 12, borderRadius: 8 }}
        onClick={() => setExpandedId(expanded ? null : app.id)}
      >
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={12} align="center">
              <Title level={5} style={{ margin: 0 }}>
                {app.jobTitle || app.job?.title || '—'}
              </Title>
              <Text className="salary-text" style={{ fontSize: 16 }}>
                {salary}
              </Text>
              <Tag color={handleStatusColor(app.status)} style={{ marginLeft: 8 }}>
                {handleStatusLabel(app.status)}
              </Tag>
            </Space>
            <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
              {app.companyName && <Text>{app.companyName}</Text>}
              {app.city && (
                <Tag color="blue" icon={<EnvironmentOutlined />}>
                  {app.city}
                </Tag>
              )}
              {app.appliedAt && (
                <Tag icon={<ClockCircleOutlined />}>
                  投递于 {app.appliedAt}
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Button type="link" icon={expanded ? <EyeOutlined /> : <EyeOutlined />}>
              {expanded ? '收起' : '查看详情'}
            </Button>
          </Col>
        </Row>

        {expanded && (
          <div style={{ marginTop: 16 }}>
            <Divider style={{ margin: '12px 0' }} />
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="职位描述">
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {app.jobDescription || app.job?.description || '暂无'}
                </Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="HR 备注">
                <Paragraph style={{ margin: 0 }}>
                  {app.hrRemark || '暂无备注'}
                </Paragraph>
              </Descriptions.Item>
              {app.interviewTime && (
                <Descriptions.Item label="面试时间">
                  {app.interviewTime}
                </Descriptions.Item>
              )}
              {app.interviewVenue && (
                <Descriptions.Item label="面试地点">
                  {app.interviewVenue}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="page-container">
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              我的投递记录
            </Title>
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              style={{ width: 160 }}
              placeholder="按状态筛选"
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Card bodyStyle={{ padding: 12 }} style={{ borderRadius: 12 }}>
        <Spin spinning={loading}>
          {applications.length === 0 && !loading ? (
            <Empty description="暂无投递记录" style={{ padding: 40 }} />
          ) : (
            <List dataSource={applications} renderItem={renderItem} />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default ApplicationPage
