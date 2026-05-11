import React, { useEffect, useState } from 'react'
import { Table, Button, Typography, Tag, Space, message, Modal, Card } from 'antd'
import api from '../../api'

const { Title } = Typography

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/orders')
      setOrders(data.list || [])
    } catch (error) {
      console.error('加载订单失败', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待支付' },
      paid: { color: 'blue', text: '已支付' },
      shipped: { color: 'cyan', text: '已发货' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
      refunded: { color: 'red', text: '已退款' }
    }
    const info = statusMap[status] || { color: 'default', text: status }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const handleShip = async (order: any) => {
    Modal.confirm({
      title: '确认发货？',
      onOk: async () => {
        try {
          await api.post(`/admin/orders/${order.id}/ship`)
          message.success('已发货')
          loadOrders()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      }
    })
  }

  const handleRefund = async (order: any) => {
    Modal.confirm({
      title: '确认退款？',
      onOk: async () => {
        try {
          await api.post(`/admin/orders/${order.id}/refund`)
          message.success('已退款')
          loadOrders()
        } catch (error: any) {
          message.error(error.message || '操作失败')
        }
      }
    })
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no'
    },
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: any) => record.user?.nickname || record.user?.username
    },
    {
      title: '商品',
      key: 'products',
      render: (_: any, record: any) => (
        <Space>
          {record.order_items?.slice(0, 2).map((item: any) => (
            <span key={item.id}>{item.product_name} x{item.quantity}</span>
          ))}
          {record.order_items?.length > 2 && <span>...</span>}
        </Space>
      )
    },
    {
      title: '金额',
      key: 'total_amount',
      render: (_: any, record: any) => <span style={{ color: '#ff4d4f' }}>¥{record.total_amount}</span>
    },
    {
      title: '收货人',
      key: 'shipping',
      render: (_: any, record: any) => `${record.shipping_name} ${record.shipping_phone}`
    },
    {
      title: '收货地址',
      dataIndex: 'shipping_address',
      key: 'shipping_address',
      width: 200
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: any) => getStatusTag(record.status)
    },
    {
      title: '下单时间',
      key: 'created_at',
      render: (_: any, record: any) => new Date(record.created_at).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        const actions = []
        if (record.status === 'paid') {
          actions.push(
            <Button type="link" onClick={() => handleShip(record)}>发货</Button>
          )
        }
        if (record.status === 'paid' || record.status === 'pending') {
          actions.push(
            <Button type="link" danger onClick={() => handleRefund(record)}>退款</Button>
          )
        }
        return <Space>{actions}</Space>
      }
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>订单管理</Title>

      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default Orders
