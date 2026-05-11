import React, { useEffect, useState } from 'react'
import { Table, Card, Typography, Tag, Button, Modal, message, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getOrderList, getOrderDetail, payOrder } from '../../utils/api'

const { Title } = Typography

const Orders = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [orderDetail, setOrderDetail] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getOrderList({})
      setList(res.data || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const res = await getOrderDetail(id)
      setOrderDetail(res.data)
      setDetailModalVisible(true)
    } catch (error) {
      console.error('Load detail error:', error)
    }
  }

  const handlePay = (record) => {
    Modal.confirm({
      title: '确认支付',
      content: `订单金额：¥${record.total_amount}`,
      onOk: async () => {
        try {
          setLoading(true)
          await payOrder(record.id)
          message.success('支付成功')
          loadData()
        } catch (error) {
          console.error('Pay error:', error)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '待支付' },
      paid: { color: 'green', text: '已支付' },
      completed: { color: 'blue', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' }
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_no',
      key: 'order_no',
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => <span className="price">¥{amount}</span>
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleViewDetail(record.id)}>查看详情</Button>
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handlePay(record)}>去支付</Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>我的订单</Title>
      
      <Card>
        {list.length === 0 ? (
          <Empty description="暂无订单" />
        ) : (
          <Table 
            columns={columns} 
            dataSource={list.map(item => ({ ...item, key: item.id }))}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {orderDetail && (
          <div>
            <p><strong>订单编号：</strong>{orderDetail.order?.order_no}</p>
            <p><strong>订单金额：</strong><span className="price">¥{orderDetail.order?.total_amount}</span></p>
            <p><strong>订单状态：</strong>{getStatusTag(orderDetail.order?.status)}</p>
            <p><strong>创建时间：</strong>{orderDetail.order?.created_at}</p>
            <h4 style={{ marginTop: 16 }}>订单商品：</h4>
            {orderDetail.items?.map(item => (
              <div key={item.id} style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                <p>{item.project_name}</p>
                <p>单价：¥{item.price} × {item.quantity} = ¥{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
