import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Tag, Statistic, List, Badge } from 'antd'
import { 
  ClockCircleOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined 
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ticketApi, slaApi } from '../api/index.js'

const statusMap = {
  PENDING: { text: '待处理', className: 'status-pending' },
  ASSIGNED: { text: '已分配', className: 'status-assigned' },
  PROCESSING: { text: '处理中', className: 'status-processing' },
  RESOLVED: { text: '已解决', className: 'status-resolved' }
}

function AgentWorkbench() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    warning: 0,
    overdue: 0
  })
  const [myTickets, setMyTickets] = useState([])
  const [warningTickets, setWarningTickets] = useState([])
  const [overdueTickets, setOverdueTickets] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pageData, warningData, overdueData] = await Promise.all([
        ticketApi.getPage({ agentId: 2, pageNum: 1, pageSize: 10 }),
        slaApi.getWarning(),
        slaApi.getOverdue()
      ])

      const records = pageData.records || []
      const pending = records.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length
      const processing = records.filter(t => t.status === 'PROCESSING').length

      setStats({
        pending,
        processing,
        warning: warningData?.length || 0,
        overdue: overdueData?.length || 0
      })
      setMyTickets(records.slice(0, 5))
      setWarningTickets(warningData?.slice(0, 5) || [])
      setOverdueTickets(overdueData?.slice(0, 5) || [])
    } catch (error) {
      console.error('获取工作台数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    {
      title: '工单编号',
      dataIndex: 'ticketNo',
      render: (text, record) => (
        <a onClick={() => navigate(`/tickets/${record.id}`)}>{text}</a>
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        const info = statusMap[status] || { text: status, className: '' }
        return <Tag className={info.className}>{info.text}</Tag>
      }
    },
    {
      title: 'SLA截止',
      dataIndex: 'slaDeadline',
      render: (text) => text ? dayjs(text).format('MM-DD HH:mm') : '-'
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">客服工作台</h1>
      </div>

      <Row gutter={16} className="workbench-stats">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="待处理"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="处理中"
              value={stats.processing}
              prefix={<ExclamationCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="SLA预警"
              value={stats.warning}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="已超时"
              value={stats.overdue}
              prefix={<CheckCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="我的工单" style={{ marginBottom: 16 }}>
            <Table
              loading={loading}
              columns={columns}
              dataSource={myTickets}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<span><Badge status="warning" text="SLA预警工单" /></span>} 
            style={{ marginBottom: 16 }}
          >
            <List
              loading={loading}
              dataSource={warningTickets}
              renderItem={(item) => (
                <List.Item 
                  key={item.id}
                  onClick={() => navigate(`/tickets/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    title={item.ticketNo}
                    description={
                      <div>
                        <div style={{ color: '#faad14' }}>
                          截止: {item.slaDeadline ? dayjs(item.slaDeadline).format('MM-DD HH:mm') : '-'}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card 
            title={<span><Badge status="error" text="超时工单" /></span>}
          >
            <List
              loading={loading}
              dataSource={overdueTickets}
              renderItem={(item) => (
                <List.Item 
                  key={item.id}
                  onClick={() => navigate(`/tickets/${item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    title={item.ticketNo}
                    description={
                      <div style={{ color: '#ff4d4f' }}>
                        超时: {item.slaDeadline ? dayjs(item.slaDeadline).format('MM-DD HH:mm') : '-'}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AgentWorkbench