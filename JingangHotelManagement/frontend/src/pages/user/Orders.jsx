import { Card, Table, Tabs, Button, Tag, Modal, message } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState([])
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  const orderStatus = {
    0: { text: '待付款', color: 'orange' },
    1: { text: '已支付', color: 'blue' },
    2: { text: '已入住', color: 'green' },
    3: { text: '已完成', color: 'success' },
    4: { text: '已完成', color: 'success' },
    5: { text: '已取消', color: 'default' },
    6: { text: '申请取消', color: 'warning' }
  }

  useEffect(() => {
    loadOrders()
  }, [activeTab])

  const loadOrders = async () => {
    try {
      const params = activeTab === 'all' ? {} : { status: getStatusValue(activeTab) }
      const res = await API.getOrders(params)
      setOrders(res.data)
    } catch (e) {}
  }

  const getStatusValue = tab => {
    const map = {
      pending: 0,
      paid: 1,
      checked: 2,
      completed: 4,
      canceled: 5,
      canceling: 6
    }
    return map[tab]
  }

  const handlePay = async order => {
    try {
      await API.payOrder(order.id)
      message.success('支付成功')
      loadOrders()
    } catch (e) {}
  }

  const handleCancel = async order => {
    Modal.confirm({
      title: '确认取消订单',
      onOk: async () => {
        try {
          if (order.status === 0) {
            await API.cancelOrder(order.id)
          } else {
            await API.applyCancelOrder(order.id)
          }
          message.success('操作成功')
          loadOrders()
        } catch (e) {}
      }
    })
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '房间', dataIndex: 'room', key: 'room', render: r => `${r?.roomNumber} - ${r?.roomType?.name}` },
    { title: '入住时间', dataIndex: 'checkIn', key: 'checkIn', render: t => t?.substring(0, 10) },
    { title: '退房时间', dataIndex: 'checkOut', key: 'checkOut', render: t => t?.substring(0, 10) },
    { title: '金额', dataIndex: 'totalPrice', key: 'totalPrice', render: p => `¥${p}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Tag color={orderStatus[s]?.color}>{orderStatus[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        {record.status === 0 && <Button type="primary" size="small" onClick={() => handlePay(record)}>支付</Button>}
        {[0, 1].includes(record.status) && <Button size="small" danger onClick={() => handleCancel(record)}>取消</Button>}
      </div>
    ) }
  ]

  const items = [
    { key: 'all', label: '所有订单' },
    { key: 'pending', label: '待付款' },
    { key: 'paid', label: '已支付' },
    { key: 'checked', label: '已入住' },
    { key: 'completed', label: '已完成' },
    { key: 'canceling', label: '申请取消' },
    { key: 'canceled', label: '已取消' }
  ]

  return (
    <div>
      <h2>我的订单</h2>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}

export default Orders
