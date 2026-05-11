import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Tag, Typography, Descriptions, Popconfirm, message, Select, Input } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

const ORDER_STATUS = {
  0: { text: '待支付', color: 'orange' },
  1: { text: '已支付', color: 'blue' },
  2: { text: '已发货', color: 'purple' },
  3: { text: '已完成', color: 'green' },
  4: { text: '已退款', color: 'default' },
  5: { text: '已取消', color: 'default' }
}

function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({ order_no: '', status: '' })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    loadOrders()
  }, [pagination.current, pagination.pageSize])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters
      }
      const res = await adminApi.getOrders(params)
      setOrders(res.data.list || [])
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(p => ({ ...p, current: 1 }))
    loadOrders()
  }

  const handleViewDetail = async (id) => {
    try {
      const res = await adminApi.getOrderDetail(id)
      setSelectedOrder(res.data)
      setDetailModalVisible(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleShip = async (id) => {
    try {
      await adminApi.shipOrder(id)
      message.success('发货成功')
      loadOrders()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 180
    },
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      render: (_, record) => record.user?.nickname || record.user?.username
    },
    {
      title: '商品数量',
      key: 'items_count',
      render: (_, record) => record.items?.length || 0
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{amount}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const s = ORDER_STATUS[status] || ORDER_STATUS[0]
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>详情</Button>
          {record.status === 1 && (
            <Popconfirm
              title="确定要发货吗？"
              onConfirm={() => handleShip(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text">发货</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>订单管理</Title>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索订单号"
            allowClear
            enterButton={<SearchOutlined />}
            value={filters.order_no}
            onSearch={handleSearch}
            onChange={(e) => setFilters(f => ({ ...f, order_no: e.target.value }))}
            style={{ width: 250 }}
          />
          <Select
            placeholder="订单状态"
            allowClear
            style={{ width: 120 }}
            value={filters.status || undefined}
            onChange={(value) => {
              setFilters(f => ({ ...f, status: value || '' }))
              setPagination(p => ({ ...p, current: 1 }))
            }}
          >
            {Object.entries(ORDER_STATUS).map(([key, value]) => (
              <Option key={key}>{value.text}</Option>
            ))}
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize }))
        }}
      />

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="订单号">{selectedOrder.order_no}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={ORDER_STATUS[selectedOrder.status]?.color}>
                  {ORDER_STATUS[selectedOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="用户">
                {selectedOrder.user?.nickname || selectedOrder.user?.username}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {dayjs(selectedOrder.created_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {selectedOrder.address_info?.province} {selectedOrder.address_info?.city} {selectedOrder.address_info?.district} {selectedOrder.address_info?.detail}
                <br />
                收货人: {selectedOrder.address_info?.name} 电话: {selectedOrder.address_info?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额" span={2}>
                <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 'bold' }}>
                  ¥{selectedOrder.total_amount}
                </span>
              </Descriptions.Item>
              {selectedOrder.remark && (
                <Descriptions.Item label="订单备注" span={2}>{selectedOrder.remark}</Descriptions.Item>
              )}
            </Descriptions>
            <div>
              <Title level={4}>商品列表</Title>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 8, textAlign: 'left' }}>商品</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>数量</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>单价</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>小计</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={item.product?.image || 'https://picsum.photos/40/40'} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                          <span>{item.product?.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{item.quantity}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>¥{item.price}</td>
                      <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>¥{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default OrderManagement
