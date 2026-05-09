import { useEffect, useState } from 'react'
import { Row, Col, Card, Input, Select, Button, Pagination, Empty, Tag } from 'antd'
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { publicApi } from '../../utils/api'

function Knowledge() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ keyword: '', category: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await publicApi.getKnowledge({ ...filters, page: pagination.page, page_size: pagination.page_size, only_published: 1 })
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ marginBottom: 24 }}>学业规划知识</h2>
      
      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Input.Group compact style={{ display: 'flex', gap: 8 }}>
          <Input 
            placeholder="搜索知识文章" 
            style={{ width: 250 }}
            allowClear
            value={filters.keyword}
            onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))}
            onPressEnter={() => setPagination(p => ({ ...p, page: 1 }))}
          />
          <Select 
            placeholder="全部分类" 
            style={{ width: 180 }} 
            allowClear
            value={filters.category || undefined}
            onChange={v => { setFilters(f => ({ ...f, category: v || '' })); setPagination(p => ({ ...p, page: 1 })) }}
          >
            <Select.Option value="学业规划">学业规划</Select.Option>
            <Select.Option value="职业发展">职业发展</Select.Option>
            <Select.Option value="考研指导">考研指导</Select.Option>
            <Select.Option value="留学指南">留学指南</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={() => setPagination(p => ({ ...p, page: 1 }))}>
            搜索
          </Button>
        </Input.Group>
      </div>

      {data.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {data.map(item => (
              <Col span={24} key={item.id}>
                <Card 
                  className="card-hover" 
                  hoverable
                  onClick={() => navigate(`/knowledge/${item.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: 8 }}>{item.title}</h3>
                      <div style={{ marginBottom: 8 }}>
                        {item.category && <Tag color="blue">{item.category}</Tag>}
                        {item.author && <span style={{ color: '#999', marginRight: 16 }}>作者: {item.author}</span>}
                        <span style={{ color: '#999' }}><EyeOutlined /> {item.views}</span>
                      </div>
                      <p style={{ color: '#666', margin: 0 }}>
                        {item.summary || item.content?.slice(0, 150) || '暂无摘要'}...
                      </p>
                    </div>
                    {item.attachment && (
                      <Button 
                        type="link" 
                        icon={<DownloadOutlined />}
                        onClick={e => {
                          e.stopPropagation()
                          window.open(publicApi.downloadKnowledge(item.id))
                        }}
                      >
                        下载附件
                      </Button>
                    )}
                  </div>
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
        <Empty description="暂无知识文章" />
      )}
    </div>
  )
}

export default Knowledge
