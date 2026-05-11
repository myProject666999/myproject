import { Card, Table, Button, Modal, Form, Input, Select, message, Rate } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [currentReview, setCurrentReview] = useState(null)
  const [form] = Form.useForm()

  const reviewStatus = {
    0: { text: '待审核', color: 'orange' },
    1: { text: '已通过', color: 'green' },
    2: { text: '未通过', color: 'red' }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const res = await API.getAdminReviews()
      setReviews(res.data)
    } catch (e) {}
  }

  const handleAudit = record => {
    setCurrentReview(record)
    form.resetFields()
    setModalVisible(true)
  }

  const onFinish = async values => {
    try {
      await API.auditReview(currentReview.id, values)
      message.success('审核成功')
      setModalVisible(false)
      loadReviews()
    } catch (e) {}
  }

  const columns = [
    { title: '用户', dataIndex: 'user', key: 'user', render: u => u?.username },
    { title: '订单号', dataIndex: 'order', key: 'order', render: o => o?.orderNo },
    { title: '房间', dataIndex: 'order', key: 'room', render: o => o?.room?.roomNumber },
    { title: '评分', dataIndex: 'rating', key: 'rating', render: r => <Rate disabled value={r} /> },
    { title: '内容', dataIndex: 'content', key: 'content' },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <span style={{ color: reviewStatus[s]?.color }}>{reviewStatus[s]?.text}</span> },
    { title: '回复', dataIndex: 'reply', key: 'reply' },
    { title: '操作', key: 'action', render: (_, record) => (
      <Button size="small" type="primary" onClick={() => handleAudit(record)} disabled={record.status !== 0}>审核</Button>
    ) }
  ]

  return (
    <div>
      <h2>评价管理</h2>
      <Card>
        <Table columns={columns} dataSource={reviews} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="审核评价" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <div style={{ marginBottom: 16 }}>
          <p><strong>用户：</strong>{currentReview?.user?.username}</p>
          <p><strong>评分：</strong><Rate disabled value={currentReview?.rating} /></p>
          <p><strong>内容：</strong>{currentReview?.content}</p>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="status" label="审核结果" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>通过</Select.Option>
              <Select.Option value={2}>不通过</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reply" label="回复">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>提交</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ReviewManagement
