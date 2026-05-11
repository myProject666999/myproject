import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Pagination, Input, Select, Typography, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const Products: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [page, categoryId])

  useEffect(() => {
    const urlKeyword = searchParams.get('keyword')
    if (urlKeyword) {
      setKeyword(urlKeyword)
      loadProducts()
    }
  }, [searchParams])

  const loadCategories = async () => {
    try {
      const data = await api.get('/product-categories')
      setCategories(data.list || data || [])
    } catch (error) {
      console.error('加载分类失败', error)
    }
  }

  const loadProducts = async () => {
    try {
      let url = `/products?page=${page}&page_size=${pageSize}`
      if (categoryId) url += `&category_id=${categoryId}`
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
      const data = await api.get(url)
      setProducts(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载商品失败', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadProducts()
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>宠物用品</Title>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="搜索商品"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleSearch}
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
        {products.map(product => (
          <Col xs={12} sm={8} md={6} lg={4} key={product.id}>
            <Card
              hoverable
              className="product-card"
              onClick={() => navigate(`/products/${product.id}`)}
              cover={
                <img
                  alt={product.name}
                  src={product.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20product%20placeholder&image_size=square'}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
            >
              <Card.Meta
                title={<Text ellipsis style={{ color: '#333' }}>{product.name}</Text>}
                description={
                  <div>
                    <span style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>¥{product.price}</span>
                    {product.original_price && (
                      <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: 8 }}>¥{product.original_price}</span>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {products.length > 0 && (
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

export default Products
