import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Pagination, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getIntroList } from '../utils/api'

const { Title, Paragraph } = Typography

const IntroList = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadData(1)
  }, [])

  const loadData = async (currentPage) => {
    try {
      const res = await getIntroList({ page: currentPage, page_size: 9 })
      setList(res.data.list || [])
      setTotal(res.data.total || 0)
      setPage(currentPage)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  return (
    <div>
      <Title level={2} className="section-title">学校简介</Title>
      
      {list.length === 0 ? (
        <Empty description="暂无学校简介信息" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {list.map(item => (
              <Col span={8} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  cover={
                    <div style={{ 
                      height: 200, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 48
                    }}>
                      🏫
                    </div>
                  }
                  onClick={() => navigate(`/intros/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2}>{item.content}</Paragraph>
                        <div style={{ marginTop: 8, color: '#999 }}>
                          👁 {item.view_count} 浏览 · 👍 {item.like_count} 赞
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

export default IntroList
