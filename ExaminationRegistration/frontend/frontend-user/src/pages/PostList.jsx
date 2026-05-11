import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Pagination, Empty, Button, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getPostList } from '../utils/api'

const { Title } = Typography

const PostList = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadData(1)
  }, [])

  const loadData = async (currentPage) => {
    try {
      const res = await getPostList({ page: currentPage, page_size: 9 })
      setList(res.data.list || [])
      setTotal(res.data.total || 0)
      setPage(currentPage)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} className="section-title" style={{ margin: 0 }}>论坛信息</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            const token = localStorage.getItem('token')
            if (!token) {
              navigate('/login')
              return
            }
            navigate('/posts/create')
          }}
        >
          发布帖子
        </Button>
      </div>
      
      {list.length === 0 ? (
        <Empty description="暂无帖子" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {list.map(item => (
              <Col span={8} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  onClick={() => navigate(`/posts/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title}
                    description={
                      <div>
                        <p style={{ color: '#666' }}>{item.content?.substring(0, 80)}...</p>
                        <div style={{ marginTop: 8 }}>
                          {item.category && <Tag color="blue">{item.category}</Tag>}
                          <span style={{ marginLeft: 8, color: '#999' }}>👁 {item.view_count}</span>
                          <span style={{ marginLeft: 8, color: '#999' }}>👍 {item.like_count}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination 
              current={page} 
              total={total} 
              pageSize={9}
              onChange={loadData}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default PostList
