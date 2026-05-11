import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Pagination, Empty, Button, Tag, Modal, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getPaperList, getPaperDetail } from '../utils/api'

const { Title } = Typography

const PaperList = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadData(1)
  }, [])

  const loadData = async (currentPage) => {
    try {
      const res = await getPaperList({ page: currentPage, page_size: 12 })
      setList(res.data.list || [])
      setTotal(res.data.total || 0)
      setPage(currentPage)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleStartExam = (item) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    
    Modal.confirm({
      title: '确认开始考试',
      content: `试卷：${item.title}\n时长：${item.duration}分钟\n总分：${item.total_score}分\n及格分：${item.pass_score}分`,
      onOk: () => {
        navigate(`/papers/${item.id}/exam`)
      }
    })
  }

  return (
    <div>
      <Title level={2} className="section-title">试卷中心</Title>
      
      {list.length === 0 ? (
        <Empty description="暂无试卷" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {list.map(item => (
              <Col span={6} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  cover={
                    <div style={{ 
                      height: 160, 
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 64
                    }}>
                      📝
                    </div>
                  }
                >
                  <Card.Meta 
                    title={item.title}
                    description={
                      <div>
                        <p style={{ color: '#666' }}>{item.description?.substring(0, 40)}...</p>
                        <div style={{ marginBottom: 12 }}>
                          <Tag color="blue">时长: {item.duration}分钟</Tag>
                          <Tag color="green">总分: {item.total_score}分</Tag>
                          <Tag color="orange">及格: {item.pass_score}分</Tag>
                        </div>
                        <Button 
                          type="primary" 
                          block
                          onClick={() => handleStartExam(item)}
                        >
                          开始考试
                        </Button>
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
              pageSize={12}
              onChange={loadData}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default PaperList
