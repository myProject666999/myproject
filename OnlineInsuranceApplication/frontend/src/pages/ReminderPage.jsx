import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Tabs, message, Badge, Select } from 'antd'
import { BellOutlined, CheckCircleOutlined, ReadOutlined, SendOutlined } from '@ant-design/icons'
import { reminderApi, paymentApi } from '../api'
import { formatDate, formatMoney, getStatusLabel, getStatusTag, getReminderTypeLabel, getDaysUntil } from '../utils'

const { Option } = Select

function ReminderPage() {
  const [reminders, setReminders] = useState([])
  const [upcomingPayments, setUpcomingPayments] = useState([])
  const [overduePayments, setOverduePayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [remindersData, upcomingData, overdueData] = await Promise.all([
        reminderApi.getAll(),
        paymentApi.getUpcoming(30),
        paymentApi.getOverdue(),
      ])
      setReminders(remindersData)
      setUpcomingPayments(upcomingData)
      setOverduePayments(overdueData)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsSent = async (id) => {
    try {
      await reminderApi.markAsSent(id)
      message.success('标记成功')
      fetchData()
    } catch (error) {
      message.error('标记失败')
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await reminderApi.markAsRead(id)
      message.success('标记成功')
      fetchData()
    } catch (error) {
      message.error('标记失败')
    }
  }

  const handleTriggerReminders = async () => {
    try {
      await reminderApi.trigger()
      message.success('已触发提醒检查')
      fetchData()
    } catch (error) {
      message.error('触发失败')
    }
  }

  const handleMarkPaymentPaid = async (id) => {
    try {
      await paymentApi.markAsPaid(id, {
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN' + Date.now(),
      })
      message.success('标记成功')
      fetchData()
    } catch (error) {
      message.error('标记失败')
    }
  }

  const getFilteredReminders = () => {
    let filtered = [...reminders]
    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType)
    }
    if (filterStatus) {
      filtered = filtered.filter(r => r.status === filterStatus)
    }
    return filtered
  }

  const reminderColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getReminderTypeLabel(type),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '提醒日期',
      dataIndex: 'reminderDate',
      key: 'reminderDate',
      width: 120,
      render: (date) => {
        const days = getDaysUntil(date)
        let color = '#8c8c8c'
        if (days < 0) color = '#f5222d'
        else if (days <= 7) color = '#fa8c16'
        return (
          <span style={{ color }}>
            {formatDate(date)}
            {days >= 0 && ` (${days}天后)`}
            {days < 0 && ` (已过期${Math.abs(days)}天)`}
          </span>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => handleMarkAsSent(record.id)}
            >
              标记已发送
            </Button>
          )}
          {record.status === 'SENT' && (
            <Button
              type="link"
              icon={<ReadOutlined />}
              onClick={() => handleMarkAsRead(record.id)}
            >
              标记已读
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const upcomingColumns = [
    {
      title: '保单号',
      key: 'policyNumber',
      render: (_, record) => record.policy?.policyNumber || '-',
    },
    {
      title: '应缴日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        const days = getDaysUntil(date)
        let color = '#8c8c8c'
        if (days <= 7) color = '#fa8c16'
        if (days <= 3) color = '#f5222d'
        return <span style={{ color }}>{formatDate(date)} ({days}天后)</span>
      },
    },
    {
      title: '应缴金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatMoney(amount),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => handleMarkPaymentPaid(record.id)}
        >
          标记已缴
        </Button>
      ),
    },
  ]

  const overdueColumns = [
    {
      title: '保单号',
      key: 'policyNumber',
      render: (_, record) => record.policy?.policyNumber || '-',
    },
    {
      title: '应缴日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        const days = Math.abs(getDaysUntil(date))
        return (
          <span style={{ color: '#f5222d' }}>
            {formatDate(date)} (已逾期{days}天)
          </span>
        )
      },
    },
    {
      title: '应缴金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatMoney(amount),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className="tag-status-overdue">
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => handleMarkPaymentPaid(record.id)}
        >
          立即缴费
        </Button>
      ),
    },
  ]

  const tabItems = [
    {
      key: '1',
      label: (
        <Badge count={getFilteredReminders().filter(r => r.status === 'PENDING').length} offset={[10, 0]}>
          全部提醒
        </Badge>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <Select
              placeholder="选择类型"
              value={filterType || undefined}
              onChange={setFilterType}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="PAYMENT">缴费提醒</Option>
              <Option value="EXPIRY">到期提醒</Option>
            </Select>
            <Select
              placeholder="选择状态"
              value={filterStatus || undefined}
              onChange={setFilterStatus}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="PENDING">待发送</Option>
              <Option value="SENT">已发送</Option>
              <Option value="READ">已阅读</Option>
            </Select>
            <Button icon={<BellOutlined />} onClick={handleTriggerReminders}>
              手动触发提醒
            </Button>
          </div>
          <Table
            columns={reminderColumns}
            dataSource={getFilteredReminders()}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
    {
      key: '2',
      label: (
        <Badge count={upcomingPayments.length} offset={[10, 0]}>
          即将到期
        </Badge>
      ),
      children: (
        <Table
          columns={upcomingColumns}
          dataSource={upcomingPayments}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      ),
    },
    {
      key: '3',
      label: (
        <Badge count={overduePayments.length} offset={[10, 0]}>
          已逾期
        </Badge>
      ),
      children: (
        <Table
          columns={overdueColumns}
          dataSource={overduePayments}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">提醒中心</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-title">待处理提醒</div>
          <div className="stat-card-value" style={{ color: '#fa8c16' }}>
            {reminders.filter(r => r.status === 'PENDING').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">即将到期缴费</div>
          <div className="stat-card-value" style={{ color: '#1890ff' }}>
            {upcomingPayments.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">已逾期缴费</div>
          <div className="stat-card-value" style={{ color: '#f5222d' }}>
            {overduePayments.length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">已发送提醒</div>
          <div className="stat-card-value" style={{ color: '#52c41a' }}>
            {reminders.filter(r => r.status === 'SENT' || r.status === 'READ').length}
          </div>
        </div>
      </div>

      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  )
}

export default ReminderPage
