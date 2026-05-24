import React, { useState, useEffect } from 'react'
import { Table, Tag, Select, Input, Button, Space, DatePicker, Card } from 'antd'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ticketApi } from '../api/index.js'

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

const slaStatusMap = {
  NORMAL: { text: '正常', className: 'sla-normal' },
  WARNING: { text: '预警', className: 'sla-warning' },
  OVERDUE: { text: '超时', className: 'sla-overdue' }
}

function TicketList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    priority: ''
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await ticketApi.getPage({
        ...filters,
        pageNum: pagination.current,
        pageSize: pagination.pageSize
      })
      setData(res.records || [])
      setPagination(prev => ({ ...prev, total: res.total || 0 }))
    } catch (error) {
      console.error('获取工单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const handleReset = () => {
    setFilters({ keyword: '', status: '', priority: '' })
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const columns = [
    {
      title: '工单编号',
      dataIndex: 'ticketNo',
      width: 150,
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
      width: 100,
      render: (status) => {
        const info = statusMap[status] || { text: status, className: '' }
        return <Tag className={info.className}>{info.text}</Tag>
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority) => {
        const info = priorityMap[priority] || { text: priority, className: '' }
        return <Tag className={info.className}>{info.text}</Tag>
      }
    },
    {
      title: 'SLA状态',
      dataIndex: 'slaStatus',
      width: 100,
      render: (status) => {
        if (!status) return '-'
        const info = slaStatusMap[status] || { text: status, className: '' }
        return <span className={info.className}>{info.text}</span>
      }
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: 'SLA截止',
      dataIndex: 'slaDeadline',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">工单列表</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tickets/create')}>
          提交工单
        </Button>
      </div>

      <Card className="filter-bar">
        <Space wrap>
          <Input
            placeholder="搜索工单编号/标题"
            value={filters.keyword}
            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="状态"
            value={filters.status || undefined}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            style={{ width: 120 }}
            allowClear
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Option key={key} value={key}>{val.text}</Option>
            ))}
          </Select>
          <Select
            placeholder="优先级"
            value={filters.priority || undefined}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            style={{ width: 120 }}
            allowClear
          >
            {Object.entries(priorityMap).map(([key, val]) => (
              <Option key={key} value={key}>{val.text}</Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Table
        loading={loading}
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        onChange={(page, pageSize) => {
          setPagination(prev => ({ ...prev, current: page, pageSize }))
        }}
      />
    </div>
  )
}

export default TicketList