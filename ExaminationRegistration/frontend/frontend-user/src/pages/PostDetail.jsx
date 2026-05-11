import React, { useEffect, useState } from 'react'
import { Card, Typography, Tag, Space } from 'antd'
import { useParams } from 'react-router-dom'
import { getPostDetail } from '../utils/api'

const { Title, Paragraph } = Typography

const PostDetail = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const res = await getPostDetail(id)
      setPost(res.data)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  if (!post) return null

  return (
    <div>
      <Card>
        <Title level={2}>{post.title}</Title>
        <div style={{ color: '#999', marginBottom: 24 }}>
          <Space>
            {post.category && <Tag color="blue">{post.category}</Tag>}
            <span>👁 {post.view_count} 浏览</span>
            <span>👍 {post.like_count} 赞</span>
          </Space>
        </div>
        
        <Paragraph style={{ fontSize: 16, lineHeight: 2 }}>
          {post.content}
        </Paragraph>
      </Card>
    </div>
  )
}

export default PostDetail
