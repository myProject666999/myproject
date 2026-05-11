import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Pagination, Input, Select, Empty, Button } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getProjectList, addToCart } from '../utils/api'

const { Title } = Typography
const { Search } = Input

const ProjectList = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    loadData(1, '', '')
  }, [])

  const loadData = async (currentPage, currentKeyword, currentCategory) => {
    try {
      const res = await getProjectList({ 
        page: currentPage, 
        page_size: 12,
        keyword: currentKeyword,
        category: currentCategory
      })
      setList(res.data.list || [])
      setTotal(res.data.total || 0)
      setPage(currentPage)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleSearch = (value) => {
    setKeyword(value)
    loadData(1, value, category)
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
    loadData(1, keyword, value)
  }

  const handleAddToCart = async (e, item) => {
    e.stopPropagation()
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    try {
      await addToCart({ project_id: item.id })
    } catch (error) {
      console.error('Add to cart error:', error)
    }
  }

  return (
    <div>
      <Title level={2} className="section-title">在线报名</Title>
      
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Select 
          placeholder="选择分类" 
          style={{ width: 200 }}
          allowClear
          onChange={handleCategoryChange}
          options={[
            { value: '编程语言', label: '编程语言' },
            { value: '数据科学', label: '数据科学' },
            { value: '测试', label: '测试' },
            { value: '前端', label: '前端' }
          ]}
        />
        <Search 
          placeholder="搜索项目"
          style={{ width: 300 }}
          onSearch={handleSearch}
          enterButton
        />
      </div>
      
      {list.length === 0 ? (
        <Empty description="暂无报名项目" />
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
                      height: 180, 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 48
                    }}>
                      📚
                    </div>
                  }
                  onClick={() => navigate(`/projects/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.name}
                    description={
                      <div>
                        <p style={{ color: '#666' }}>{item.description?.substring(0, 50)}...</p>
                        <div style={{ marginBottom: 8 }}>
                          <span className="price">¥{item.price}</span>
                          <span className="original-price">¥{item.original_price}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#999' }}>时长: {item.duration}</span>
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<ShoppingCartOutlined />}
                            onClick={(e) => handleAddToCart(e, item)}
                          >
                            加入购物车
                          </Button>
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
              pageSize={12}
              onChange={(p) => loadData(p, keyword, category)}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectList
