import { Card, Table, Tabs, Modal, Form, Input, Rate, Button, Select, message } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const MyReviews = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [reviews, setReviews] = useState([])
  const [orders, setOrders] = useState([])
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [form] = Form.useForm()

  const reviewStatus = {
    0: { text: '待审核', color: 'orange' },
    1: { text: '已通过', color: 'green' },
    2: { text: '未通过', color: 'red' }
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      const params = activeTab === 'all' ? {} : { status: getStatusValue(activeTab) }
      const [reviewRes, orderRes] = await Promise.all([
        API.getMyReviews(params),
        API.getOrders({ status: 4 })
      ])
      setReviews(reviewRes.data)
      setOrders(orderRes.data)
    } catch (e) {}
  }

  const getStatusValue = tab => {
    const map = { pending: 0, passed: 1, rejected: 2 }
    return map[tab]
  }

  const columns = [
    { title: '订单号', dataIndex: 'order', key: 'order', render: o => o?.orderNo },
    { title: '房间', dataIndex: 'order', key: 'room', render: o => o?.room?.roomNumber },
    { title: '评分', dataIndex: 'rating', key: 'rating', render: r => <Rate disabled value={r} /> },
    { title: '内容', dataIndex: 'content', key: 'content' },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <span style={{ color: reviewStatus[s]?.color }}>{reviewStatus[s]?.text}</span> },
    { title: '回复', dataIndex: 'reply', key: 'reply' }
  ]

  const handleAddReview = () => {
    setReviewModalVisible(true)
  }

  const onFinish = async values => {
    try {
      await API.createReview(values)
      message.success('评价提交成功')
      setReviewModalVisible(false)
      loadData()
    } catch (e) {}
  }

  const items = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'passed', label: '已通过' },
    { key: 'rejected', label: '未通过' }
  ]

  const reviewedOrderIds = reviews.map(r => r.orderId)
  const availableOrders = orders.filter(o => !reviewedOrderIds.includes(o.id))

  return (
    <div>
      <h2>我的评价</h2>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleAddReview} disabled={availableOrders.length === 0}>
            我要评价
          </Button>
        </div>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        <Table columns={columns} dataSource={reviews} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="提交评价" open={reviewModalVisible} onCancel={() => setReviewModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="orderId" label="选择订单" rules={[{ required: true }]}>
            <Select>
              {availableOrders.map(o => (
                <Select.Option key={o.id} value={o.id}>
                  {o.orderNo} - {o.room?.roomNumber} ({o.checkIn?.substring(0, 10)} 至 {o.checkOut?.substring(0, 10)})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="rating" label="评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="content" label="评价内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>提交评价</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyReviews
