import { Card, Table, Button, Modal, Select, message, Tag } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
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
  }, [])

  const loadOrders = async () => {
    try {
      const res = await API.getAdminOrders()
      setOrders(res.data)
    } catch (e) {}
  }

  const handleUpdateStatus = (order, status) => {
    setCurrentOrder(order)
    setModalVisible(true)
  }

  const confirmUpdate = async status => {
    try {
      await API.updateOrderStatus(currentOrder.id, { status })
      message.success('更新成功')
      setModalVisible(false)
      loadOrders()
    } catch (e) {}
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户', dataIndex: 'user', key: 'user', render: u => u?.username },
    { title: '房间', dataIndex: 'room', key: 'room', render: r => `${r?.roomNumber} - ${r?.roomType?.name}` },
    { title: '入住人', dataIndex: 'guestName', key: 'guestName' },
    { title: '入住时间', dataIndex: 'checkIn', key: 'checkIn', render: t => t?.substring(0, 10) },
    { title: '退房时间', dataIndex: 'checkOut', key: 'checkOut', render: t => t?.substring(0, 10) },
    { title: '金额', dataIndex: 'totalPrice', key: 'totalPrice', render: p => `¥${p}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Tag color={orderStatus[s]?.color}>{orderStatus[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        {record.status === 1 && <Button size="small" type="primary" onClick={() => handleUpdateStatus(record, 2)}>办理入住</Button>}
        {record.status === 2 && <Button size="small" type="primary" onClick={() => handleUpdateStatus(record, 4)}>完成退房</Button>}
        {record.status === 6 && (
          <>
            <Button size="small" type="primary" onClick={() => handleUpdateStatus(record, 5)}>同意取消</Button>
            <Button size="small" onClick={() => handleUpdateStatus(record, 1)}>拒绝取消</Button>
          </>
        )}
      </div>
    ) }
  ]

  return (
    <div>
      <h2>订单管理</h2>
      <Card>
        <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="确认操作"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => confirmUpdate(1)}
      >
        <p>订单号：{currentOrder?.orderNo}</p>
        <p>确认执行此操作？</p>
      </Modal>
    </div>
  )
}

export default OrderManagement
