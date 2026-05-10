import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Select, Input, Pagination, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { scriptApi, scriptTypeApi } from '../services/api'
import WebLayout from '../components/Layout'

const { Title, Text } = Typography
const { Search } = Input

function Scripts() {
  const [scripts, setScripts] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  })
  const [filters, setFilters] = useState({
    type_id: '',
    keyword: ''
  })

  useEffect(() => {
    loadTypes()
  }, [])

  useEffect(() => {
    loadScripts()
  }, [filters, pagination.current])

  const loadTypes = async () => {
    const res = await scriptTypeApi.list()
    setTypes(res.data || [])
  }

  const loadScripts = async () => {
    setLoading(true)
    try {
      const res = await scriptApi.list({
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters
      })
      setScripts(res.data?.list || [])
      setPagination(prev => ({ ...prev, total: res.data?.total || 0 }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <WebLayout>
      <Title level={2}>剧本列表</Title>

      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Select
          placeholder="全部类型"
          style={{ width: 150 }}
          allowClear
          onChange={(v) => setFilters(prev => ({ ...prev, type_id: v }))}
        >
          {types.map(t => (
            <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
          ))}
        </Select>
        <Search
          placeholder="搜索剧本"
          style={{ width: 300 }}
          onSearch={(v) => setFilters(prev => ({ ...prev, keyword: v }))}
          allowClear
        />
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {scripts.map((script) => (
            <Col key={script.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <img
                    src={script.cover || 'https://placehold.co/400x300?text=剧本'}
                    alt={script.title}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={<Link to={`/scripts/${script.id}`}>{script.title}</Link>}
                  description={
                    <div>
                      <Text type="secondary">{script.type?.name}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text strong style={{ color: '#f5222d' }}>¥{script.price}</Text>
                        <Text type="secondary" style={{ marginLeft: 12 }}>{script.players}人 · {script.duration}分钟</Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {scripts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text type="secondary">暂无剧本</Text>
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page) => setPagination(prev => ({ ...prev, current: page }))}
          />
        </div>
      </Spin>
    </WebLayout>
  )
}

export default Scripts
