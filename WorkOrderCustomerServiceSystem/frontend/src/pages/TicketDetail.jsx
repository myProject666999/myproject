import React, { useState, useEffect } from 'react'
import { Descriptions, Tag, Button, Space, Card, Input, Form, Select, message, Divider, List } from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ticketApi, userApi } from '../api/index.js'

const { TextArea } = Input
const { Option } = Select

const statusMap = {
  PENDING: { text: '待处理', className: 'status-pending' },
  ASSIGNED: { text: '已分配', className: 'status-assigned' },
  PROCESSING: { text: '处理中', className: 'status-processing' },
  RESOLVED: { text: '已解决', className: 'status-resolved' },
  CLOSED: { text: '已关闭', className: 'status-closed' },
  REJECTED: { text: '已拒绝', className: 'status-rejected' }
}

const priorityMap = {
  LOW: { text: '低', className: 'priority-low' },
  MEDIUM: { text: '中', className: 'priority-medium' },
  HIGH: { text: '高', className: 'priority-high' },
  URGENT: { text: '紧急', className: 'priority-urgent' }
}

function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [replies, setReplies] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [replyLoading, setReplyLoading] = useState(false)
  const [assignLoading, setAssignLoading] = useState(false)
  const [form] = Form.useForm()
  const [assignForm] = Form.useForm()

  const currentUser = { id: 2, role: 'AGENT', name: '客服小张' }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ticketData, replyData] = await Promise.all([
        ticketApi.getById(id),
        ticketApi.getReplies(id)
      ])
      setTicket(ticketData)
      setReplies(replyData || [])
    } catch (error) {
      message.error('获取工单详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchAgents()
  }, [id])

  const fetchAgents = async () => {
    try {
      const data = await userApi.getAgents()
      setAgents(data || [])
    } catch (error) {
      console.error('获取客服列表失败:', error)
    }
  }

  const handleReply = async () => {
    try {
      const values = await form.validateFields()
      setReplyLoading(true)
      await ticketApi.reply({
        ticketId: ticket.id,
        userId: currentUser.id,
        content: values.content
      })
      message.success('回复成功')
      form.resetFields()
      fetchData()
    } catch (error) {
      if (error.errorFields) return
      message.error('回复失败')
    } finally {
      setReplyLoading(false)
    }
  }

  const handleAssign = async () => {
    try {
      const values = await assignForm.validateFields()
      setAssignLoading(true)
      await ticketApi.assign({
        ticketId: ticket.id,
        agentId: values.agentId,
        operatorId: currentUser.id
      })
      message.success('分配成功')
      fetchData()
    } catch (error) {
      if (error.errorFields) return
      message.error('分配失败')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    try {
      await ticketApi.updateStatus(ticket.id, status, currentUser.id)
      message.success('状态更新成功')
      fetchData()
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  if (loading || !ticket) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
  }

  const statusInfo = statusMap[ticket.status] || { text: ticket.status, className: '' }
  const priorityInfo = priorityMap[ticket.priority] || { text: ticket.priority, className: '' }

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <h1 className="page-title" style={{ margin: 0 }}>工单详情 - {ticket.ticketNo}</h1>
        </Space>
        <Space>
          {ticket.status === 'PENDING' && (
            <Button type="primary" onClick={() => handleUpdateStatus('PROCESSING')}>
              开始处理
            </Button>
          )}
          {ticket.status === 'PROCESSING' && (
            <Button type="primary" onClick={() => handleUpdateStatus('RESOLVED')}>
              标记解决
            </Button>
          )}
          {ticket.status === 'RESOLVED' && (
            <Button type="primary" onClick={() => handleUpdateStatus('CLOSED')}>
              关闭工单
            </Button>
          )}
        </Space>
      </div>

      <Card className="ticket-card" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="工单编号">{ticket.ticketNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag className={statusInfo.className}>{statusInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="标题" span={2}>{ticket.title}</Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag className={priorityInfo.className}>{priorityInfo.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="SLA状态">
            {ticket.slaStatus === 'NORMAL' && <Tag color="green">正常</Tag>}
            {ticket.slaStatus === 'WARNING' && <Tag color="orange">预警</Tag>}
            {ticket.slaStatus === 'OVERDUE' && <Tag color="red">超时</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="提交用户">{ticket.customerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="处理客服">{ticket.agentName || '未分配'}</Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {ticket.createdAt ? dayjs(ticket.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="SLA截止">
            {ticket.slaDeadline ? dayjs(ticket.slaDeadline).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="问题描述" span={2}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {ticket.status === 'PENDING' && (
        <Card className="ticket-card" style={{ marginBottom: 16 }} title="分配工单">
          <Form form={assignForm} layout="inline">
            <Form.Item name="agentId" label="选择客服" rules={[{ required: true, message: '请选择客服' }]}>
              <Select style={{ width: 200 }} placeholder="请选择客服">
                {agents.map(agent => (
                  <Option key={agent.id} value={agent.id}>{agent.realName}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={assignLoading} onClick={handleAssign}>
                分配
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Card className="ticket-card" title="沟通记录">
        <div className="reply-list" style={{ marginBottom: 16 }}>
          <List
            dataSource={replies}
            renderItem={(reply) => (
              <List.Item key={reply.id} style={{ borderBottom: 'none', padding: 0 }}>
                <div className={`reply-item ${reply.userRole === 'AGENT' ? 'reply-agent' : 'reply-customer'}`} style={{ width: '100%' }}>
                  <div className="reply-meta">
                    <strong>{reply.userName}</strong>
                    <span style={{ marginLeft: 8 }}>
                      {dayjs(reply.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                    <Tag style={{ marginLeft: 8 }} color={reply.userRole === 'AGENT' ? 'blue' : 'green'}>
                      {reply.userRole === 'AGENT' ? '客服' : '用户'}
                    </Tag>
                  </div>
                  <div className="reply-content">{reply.content}</div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <Divider />

        <Form form={form} onFinish={handleReply}>
          <Form.Item name="content" rules={[{ required: true, message: '请输入回复内容' }]}>
            <TextArea rows={4} placeholder="请输入回复内容..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={replyLoading}>
              发送回复
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default TicketDetail