import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Pagination, Input, Typography, Space, Button, Modal, Form, message, Avatar } from 'antd'
import { SearchOutlined, PlusOutlined, EyeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text, Paragraph } = Typography

const Forum: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadPosts()
  }, [page, keyword])

  const loadPosts = async () => {
    try {
      let url = `/posts?page=${page}&page_size=${pageSize}`
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
      const data = await api.get(url)
      setPosts(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载帖子失败', error)
    }
  }

  const handlePublish = async (values: any) => {
    try {
      await api.post('/posts', values)
      message.success('发布成功')
      setModalVisible(false)
      form.resetFields()
      loadPosts()
    } catch (error: any) {
      message.error(error.message || '发布失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>宠物论坛</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            if (!user) {
              message.warning('请先登录')
              navigate('/login')
              return
            }
            setModalVisible(true)
          }}
        >
          发布帖子
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input.Search
              placeholder="搜索帖子"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => setPage(1)}
              enterButton
            />
          </Col>
        </Row>
      </Card>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {posts.map(post => (
          <Card
            key={post.id}
            hoverable
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <Row gutter={16}>
              <Col span={4} md={2}>
                <Avatar size={48} icon={<UserOutlined />} />
              </Col>
              <Col span={20} md={22}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>{post.title}</Text>
                </div>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                    {post.content}
                  </Paragraph>
                  <Space>
                    <Text type="secondary">
                      <UserOutlined style={{ marginRight: 4 }} />
                      {post.user?.nickname || post.user?.username}
                    </Text>
                    <Text type="secondary">
                      <EyeOutlined style={{ marginRight: 4 }} />
                      {post.views} 浏览
                    </Text>
                    <Text type="secondary">
                      <MessageOutlined style={{ marginRight: 4 }} />
                      {post.likes || 0} 赞
                    </Text>
                    <Text type="secondary">
                      {new Date(post.created_at).toLocaleString()}
                    </Text>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>
        ))}
      </Space>

      {posts.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}

      <Modal
        title="发布帖子"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入帖子标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={8} placeholder="请输入帖子内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              发布
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Forum
