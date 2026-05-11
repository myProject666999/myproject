import React, { useEffect, useState } from 'react'
import { List, Card, Typography, Button, Tag, Empty, Modal, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getMyPosts } from '../../utils/api'

const { Title } = Typography

const MyPosts = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getMyPosts()
      setList(res.data || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>我的发布</Title>
      
      <Card>
        {list.length === 0 ? (
          <Empty description="暂无发布" />
        ) : (
          <List
            dataSource={list}
            renderItem={item => (
              <List.Item
                onClick={() => navigate(`/posts/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {item.title}
                      {item.category && <Tag color="blue" style={{ marginLeft: 8 }}>{item.category}</Tag>}
                    </span>
                  }
                  description={
                    <div>
                      <p>{item.content?.substring(0, 100)}...</p>
                      <p style={{ color: '#999' }}>
                        👁 {item.view_count} 浏览 · 👍 {item.like_count} 赞 · {item.created_at}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default MyPosts
