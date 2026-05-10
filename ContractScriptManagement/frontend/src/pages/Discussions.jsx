import { useEffect, useState } from 'react'
import { Card, List, Button, Modal, Form, Input, Select, Typography, Pagination, message } from 'antd'
import { MessageOutlined, PlusOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { discussionApi, scriptApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WebLayout from '../components/Layout'

const { Title, Text } = Typography
const { TextArea } = Input

function Discussions() {
  const [discussions, setDiscussions] = useState([])
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [pagination.current])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await discussionApi.list({
        page: pagination.current,
        page_size: pagination.pageSize
      })
      setDiscussions(res.data?.list || [])
      setPagination(prev => ({ ...prev, total: res.data?.total || 0 }))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    if (!user) {
      message.info('请先登录')
      navigate('/login')
      return
    }
    scriptApi.list({ page: 1, page_size: 100 }).then(res => setScripts(res.data?.list || []))
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      await discussionApi.create(values)
      message.success('发布成功')
      setModalVisible(false)
      loadData()
    } catch (err) {
      // Error handled
    }
  }

  return (
    <WebLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>剧本讨论</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          发布新帖
        </Button>
      </div>

      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={discussions}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable>
              <List.Item.Meta
                avatar={<MessageOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                title={
                  <Link to={`/discussions/${item.id}`}>
                    {item.title}
                  </Link>
                }
                description={
                  <div>
                    <Text type="secondary">
                      {item.user?.nickname || item.user?.username} · {item.script?.title || '综合讨论'}
                      <span style={{ marginLeft: 16 }}>浏览 {item.views}</span>
                      <span style={{ marginLeft: 16 }}>{new Date(item.created_at).toLocaleDateString()}</span>
                    </Text>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {discussions.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Text type="secondary">暂无讨论，快来发布第一条吧！</Text>
        </div>
      )}

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
        />
      </div>

      <Modal
        title="发布新帖"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入帖子标题" />
          </Form.Item>
          <Form.Item
            name="script_id"
            label="关联剧本"
          >
            <Select placeholder="选择相关剧本（可选）" allowClear>
              {scripts.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={6} placeholder="分享你的剧本体验..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>发布</Button>
          </Form.Item>
        </Form>
      </Modal>
    </WebLayout>
  )
}

export default Discussions
