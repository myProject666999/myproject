import { useState, useEffect } from 'react'
import { Table, Button, Modal, Space, Popconfirm, message, Tag, Select, Input } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { orderApi } from '../../services/api'

const { Search } = Input

function AdminOrders() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({ status: '', keyword: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await orderApi.adminList({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters
      })
      setData(res.data?.list || [])
      setPagination(prev => ({ ...prev, total: res.data?.total || 0 }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, filters])

  const handleView = (record) => {
    setDetailRecord(record)
    setDetailVisible(true)
  }

  const handleUpdateStatus = async (record, status) => {
    await orderApi.updateStatus(record.id, { status })
    message.success('操作成功')
    loadData()
  }

  const handleDelete = async (id) => {
    await orderApi.remove(id)
    message.success('删除成功')
    loadData()
  }

  const statusMap = {
    0: { color: 'orange', text: '待审核' },
    1: { color: 'green', text: '已通过' },
    2: { color: 'red', text: '已拒绝' }
  }

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '用户', dataIndex: ['user', 'username'], key: 'user' },
    { title: '剧本', dataIndex: ['script', 'title'], key: 'script' },
    { title: '房间', dataIndex: ['room', 'name'], key: 'room' },
    { title: '日期', dataIndex: 'play_date', key: 'play_date' },
    { title: '时间', dataIndex: 'play_time', key: 'play_time' },
    { title: '金额', dataIndex: 'total_amount', key: 'total_amount', render: v => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const item = statusMap[status] || { color: 'default', text: '未知' }
        return <Tag color={item.color}>{item.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>详情</Button>
          {record.status === 0 && (
            <>
              <Button type="link" onClick={() => handleUpdateStatus(record, 1)}>通过</Button>
              <Button type="link" danger onClick={() => handleUpdateStatus(record, 2)}>拒绝</Button>
            </>
          )}
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          placeholder="全部状态"
          style={{ width: 150 }}
          allowClear
          value={filters.status || undefined}
          onChange={v => setFilters(prev => ({ ...prev, status: v }))}
        >
          <Select.Option value="">全部</Select.Option>
          <Select.Option value="0">待审核</Select.Option>
          <Select.Option value="1">已通过</Select.Option>
          <Select.Option value="2">已拒绝</Select.Option>
        </Select>
        <Search
          placeholder="搜索订单号/用户名"
          style={{ width: 250 }}
          onSearch={v => setFilters(prev => ({ ...prev, keyword: v }))}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize })
        }}
      />

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[<Button onClick={() => setDetailVisible(false)}>关闭</Button>]}
      >
        {detailRecord && (
          <div>
            <p><strong>订单号：</strong>{detailRecord.order_no}</p>
            <p><strong>用户：</strong>{detailRecord.user?.username}</p>
            <p><strong>剧本：</strong>{detailRecord.script?.title}</p>
            <p><strong>房间：</strong>{detailRecord.room?.name}</p>
            <p><strong>游戏日期：</strong>{detailRecord.play_date} {detailRecord.play_time}</p>
            <p><strong>参与人数：</strong>{detailRecord.players}人</p>
            <p><strong>总金额：</strong>¥{detailRecord.total_amount}</p>
            <p><strong>状态：</strong>{statusMap[detailRecord.status]?.text}</p>
            <p><strong>备注：</strong>{detailRecord.remark || '-'}</p>
            <p><strong>下单时间：</strong>{new Date(detailRecord.created_at).toLocaleString()}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminOrders
