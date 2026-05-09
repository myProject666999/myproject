import { useEffect, useState } from 'react'
import { Row, Col, Card, Input, Select, Button, Pagination, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { publicApi } from '../../utils/api'

function Services() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 12, total: 0 })
  const [filters, setFilters] = useState({ keyword: '', category: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await publicApi.getServices({ ...filters, page: pagination.page, page_size: pagination.page_size, only_active: 1 })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [pagination.page, filters])

  const handleSearch = () => {
    setPagination(p => ({ ...p, page: 1 }))
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ marginBottom: 24 }}>服务信息</h2>
      
      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Input.Group compact style={{ display: 'flex', gap: 8 }}>
          <Input 
            placeholder="搜索服务名称" 
            style={{ width: 250 }}
            allowClear
            value={filters.keyword}
            onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select 
            placeholder="全部分类" 
            style={{ width: 180 }} 
            allowClear
            value={filters.category || undefined}
            onChange={v => { setFilters(f => ({ ...f, category: v || '' })); setPagination(p => ({ ...p, page: 1 })) }}
          >
            <Select.Option value="职业规划">职业规划</Select.Option>
            <Select.Option value="学业指导">学业指导</Select.Option>
            <Select.Option value="考研咨询">考研咨询</Select.Option>
            <Select.Option value="留学指导">留学指导</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
        </Input.Group>
      </div>

      {data.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {data.map(item => (
              <Col span={6} key={item.id}>
                <Card 
                  className="card-hover" 
                  hoverable
                  onClick={() => navigate(`/services/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title} 
                    description={
                      <div>
                        <p style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
                          {item.category} | {item.consultant || '专业顾问'}
                        </p>
                        <p style={{ color: '#999', fontSize: 12 }}>
                          {item.description?.slice(0, 50) || '暂无描述'}...
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                          <span style={{ color: '#1890ff', fontWeight: 'bold', fontSize: 18 }}>
                            ¥{item.price}
                          </span>
                          <span style={{ color: '#999', fontSize: 12 }}>{item.duration}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Pagination 
              current={pagination.page}
              pageSize={pagination.page_size}
              total={pagination.total}
              onChange={page => setPagination(p => ({ ...p, page }))}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无服务" />
      )}
    </div>
  )
}

export default Services
