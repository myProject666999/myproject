import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Space, Button, Input, List, Avatar, message } from 'antd'
import {
  UserOutlined, EyeOutlined, LikeOutlined, MessageOutlined, SendOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const PostDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadPost()
  }, [id])

  const loadPost = async () => {
    try {
      const data: any = await api.get(`/posts/${id}`)
      setPost(data.post)
      setComments(data.comments || [])
    } catch (error) {
      console.error('加载帖子失败', error)
    }
  }

  const submitComment = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!newComment.trim()) {
      message.warning('请输入评论内容')
      return
    }
    try {
      await api.post(`/posts/${id}/comments`, {
        content: newComment
      })
      message.success('评论成功')
      setNewComment('')
      loadPost()
    } catch (error: any) {
      message.error(error.message || '评论失败')
    }
  }

  if (!post) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <Title level={2}>{post.title}</Title>
        <Space style={{ marginBottom: 24 }}>
          <Text type="secondary">
            <UserOutlined style={{ marginRight: 4 }} />
            {post.user?.nickname || post.user?.username}
          </Text>
          <Text type="secondary">
            <EyeOutlined style={{ marginRight: 4 }} />
            {post.views} 浏览
          </Text>
          <Text type="secondary">
            <LikeOutlined style={{ marginRight: 4 }} />
            {post.likes || 0} 赞
          </Text>
          <Text type="secondary">
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </Space>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Paragraph>
      </Card>

      <Card title={`评论 (${comments.length})`} style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <TextArea
            rows={3}
            placeholder="发表评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={submitComment}>
            发表评论
          </Button>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text strong>{comment.user?.nickname || comment.user?.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </Text>
                  </Space>
                }
                description={comment.content}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default PostDetail
