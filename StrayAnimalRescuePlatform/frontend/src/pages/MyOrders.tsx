import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, Tag, Button, Space, message, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title } = Typography

const MyOrders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await api.get('/orders')
      setOrders(data.list || [])
    } catch (error) {
      console.error('加载订单失败', error)
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

  const handlePay = async (order: any) => {
    setLoading(true)
    try {
      await api.post(`/orders/${order.id}/pay`)
      message.success('支付成功')
      loadOrders()
    } catch (error: any) {
      message.error(error.message || '支付失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (order: any) => {
    Modal.confirm({
      title: '确认取消订单？',
      onOk: async () => {
        try {
          await api.post(`/orders/${order.id}/cancel`)
          message.success('订单已取消')
          loadOrders()
        } catch (error: any) {
          message.error(error.message || '取消失败')
        }
      }
    })
  }

  const handleConfirm = async (order: any) => {
    Modal.confirm({
      title: '确认收货？',
      onOk: async () => {
        try {
          await api.post(`/orders/${order.id}/confirm`)
          message.success('确认收货成功')
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
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => <span style={{ color: '#ff4d4f' }}>¥{amount}</span>
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
        if (record.status === 'pending') {
          actions.push(
            <Button type="primary" size="small" onClick={() => handlePay(record)}>支付</Button>
          )
          actions.push(
            <Button size="small" onClick={() => handleCancel(record)}>取消</Button>
          )
        }
        if (record.status === 'shipped') {
          actions.push(
            <Button type="primary" size="small" onClick={() => handleConfirm(record)}>确认收货</Button>
          )
        }
        return <Space>{actions}</Space>
      }
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>我的订单</Title>

      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default MyOrders
