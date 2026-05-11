import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Pagination, Input, Select, Typography, Space, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const Pets: React.FC = () => {
  const navigate = useNavigate()
  const [pets, setPets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

  useEffect(() => {
    loadCategories()
    loadPets()
  }, [page, categoryId])

  const loadCategories = async () => {
    try {
      const data = await api.get('/pet-categories')
      setCategories(data.list || data || [])
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const loadPets = async () => {
    try {
      let url = `/pets?page=${page}&page_size=${pageSize}`
      if (categoryId) url += `&category_id=${categoryId}`
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
      const data = await api.get(url)
      setPets(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载宠物失败', error)
    }
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>宠物领养</Title>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="搜索宠物"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={() => { setPage(1); loadPets() }}
              />
              <Select
                placeholder="分类筛选"
                style={{ width: 150 }}
                allowClear
                value={categoryId}
                onChange={(val) => { setCategoryId(val); setPage(1) }}
                options={categories.map(c => ({ value: String(c.id), label: c.name }))}
              />
            </Space.Compact>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {pets.map(pet => (
          <Col xs={12} sm={8} md={6} lg={4} key={pet.id}>
            <Card
              hoverable
              className="pet-card"
              onClick={() => navigate(`/pets/${pet.id}`)}
              cover={
                <img
                  alt={pet.name}
                  src={pet.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20placeholder&image_size=square'}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
            >
              <Card.Meta
                title={<Text ellipsis style={{ color: '#333' }}>{pet.name}</Text>}
                description={
                  <div>
                    <Tag color="blue">{pet.pet_category?.name || '未知'}</Tag>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">{pet.breed || '未知品种'}</Text>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {pets.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  )
}

export default Pets
