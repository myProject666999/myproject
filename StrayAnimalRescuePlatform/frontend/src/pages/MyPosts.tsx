import React, { useEffect, useState } from 'react'
import { Card, List, Typography, Button, Empty, Modal, message, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const MyPosts: React.FC = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const data = await api.get('/my-posts')
      setPosts(data || [])
    } catch (error) {
      console.error('加载帖子失败', error)
    }
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除该帖子？',
      onOk: async () => {
        try {
          await api.delete(`/posts/${id}`)
          message.success('帖子已删除')
          loadPosts()
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>我的帖子</Title>

      {posts.length === 0 ? (
        <Empty description="暂无帖子">
          <Button type="primary" onClick={() => navigate('/forum')}>去发布</Button>
        </Empty>
      ) : (
        <Card>
          <List
            dataSource={posts}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/posts/${item.id}`)}>查看</Button>,
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>删除</Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <span>
                      <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/posts/${item.id}`)}>
                        {item.title}
                      </Text>
                    </span>
                  }
                  description={
                    <span>
                      <Text type="secondary">
                        <EyeOutlined style={{ marginRight: 4 }} />{item.views}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 16 }}>
                        <MessageOutlined style={{ marginRight: 4 }} />{item.comments_count || 0}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 16 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  )
}

export default MyPosts
