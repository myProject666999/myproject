import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Tag, Descriptions, message, Select } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { getOrders, getOrderDetail } from '../utils/api'

const { Search } = Input

const OrderManagement = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  const statusMap = {
    pending: { text: '待支付', color: 'orange' },
    paid: { text: '已支付', color: 'green' },
    cancelled: { text: '已取消', color: 'red' }
  }

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await getOrders({ page, pageSize, keyword, status })
      setData(res.data.items || [])
      setPagination({
        current: page,
        pageSize,
        total: res.data.total || 0
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [keyword, status])

  const handleView = async (id) => {
    try {
      const res = await getOrderDetail(id)
      setCurrentOrder(res.data)
      setDetailModalVisible(true)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 200 },
    { title: '用户', dataIndex: 'user_name', key: 'user_name', width: 120 },
    { title: '项目名称', dataIndex: 'project_name', key: 'project_name' },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      render: (amount) => `¥${amount}`
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { title: '下单时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record.id)}
        >
          详情
        </Button>
      )
    }
  ]

  return (
    <div>
      <h2 className="page-title">订单管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="搜索订单号/用户名"
          style={{ width: 250 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="状态筛选"
          style={{ width: 150 }}
          allowClear
          onChange={setStatus}
        >
          <Select.Option value="pending">待支付</Select.Option>
          <Select.Option value="paid">已支付</Select.Option>
          <Select.Option value="cancelled">已取消</Select.Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: (page, pageSize) => fetchData(page, pageSize)
        }}
      />

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单号">{currentOrder.order_no}</Descriptions.Item>
            <Descriptions.Item label="用户">{currentOrder.user_name}</Descriptions.Item>
            <Descriptions.Item label="项目名称">{currentOrder.project_name}</Descriptions.Item>
            <Descriptions.Item label="订单金额">¥{currentOrder.total_amount}</Descriptions.Item>
            <Descriptions.Item label="订单状态">
              {statusMap[currentOrder.status]?.text || currentOrder.status}
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">{currentOrder.created_at}</Descriptions.Item>
            {currentOrder.payment_time && (
              <Descriptions.Item label="支付时间">{currentOrder.payment_time}</Descriptions.Item>
            )}
            {currentOrder.address && (
              <Descriptions.Item label="收货地址">{currentOrder.address}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default OrderManagement
