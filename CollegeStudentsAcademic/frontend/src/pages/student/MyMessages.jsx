import { useEffect, useState } from 'react'
import { List, Button, message, Modal, Form, Input, Tag, Card, Empty } from 'antd'
import { MessageOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons'
import { studentApi } from '../../utils/api'

const statusMap = { 0: '待回复', 1: '已回复' }
const statusColor = { 0: 'orange', 1: 'green' }

function MyMessages() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await studentApi.getMessages({ page: pagination.page, page_size: pagination.page_size })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [pagination.page])

  const handleSubmit = async (values) => {
    try {
      await studentApi.createMessage(values)
      message.success('留言成功，请等待回复')
      setModalVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error(error.message || '留言失败')
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>我的留言</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          发布留言
        </Button>
      </div>

      {data.length > 0 ? (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={data}
          pagination={{
            current: pagination.page,
            pageSize: pagination.page_size,
            total: pagination.total,
            onChange: page => setPagination(p => ({ ...p, page }))
          }}
          renderItem={item => (
            <Card className="message-card">
              <List.Item>
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 500 }}>{item.title}</span>
                      <Tag color={statusColor[item.status]}>{statusMap[item.status]}</Tag>
                    </div>
                  }
                  description={<span style={{ color: '#999' }}>{item.created_at}</span>}
                />
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                  <p style={{ margin: 0, color: '#333' }}>{item.content}</p>
                </div>
                {item.reply && (
                  <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 4 }}>
                    <p style={{ margin: 0, color: '#1890ff', fontWeight: 500 }}>管理员回复:</p>
                    <p style={{ margin: 0, marginTop: 4 }}>{item.reply}</p>
                  </div>
                )}
              </List.Item>
            </Card>
          )}
        />
      ) : (
        <Empty description="暂无留言" />
      )}

      <Modal
        title="发布留言"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="title" label="留言标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入留言标题" />
          </Form.Item>
          <Form.Item name="content" label="留言内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={5} placeholder="请输入留言内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} block>
              发送留言
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyMessages
