import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Tag, Button, Typography, Space, Select, Input, Pagination, Empty } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/Layout'
import { publicApi, userApi } from '../utils/api'
import { useUserStore } from '../store/useStore'

const { Title } = Typography

function ProductList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setCartCount } = useUserStore()
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category_id: searchParams.get('category_id') || '',
    sort: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [filters, pagination.current, pagination.pageSize])

  const loadCategories = async () => {
    try {
      const res = await publicApi.getCategories()
      setCategories(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.category_id && { category_id: filters.category_id })
      }
      const res = await publicApi.getProducts(params)
      setProducts(res.data.list)
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (e, product) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await userApi.addToCart({ product_id: product.id, quantity: 1 })
      const res = await userApi.getCartCount()
      setCartCount(res.data.count)
    } catch (error) {
      console.error(error)
    }
  }

  const ProductCard = ({ product }) => (
    <Card
      hoverable
      className="product-card"
      cover={
        <img 
          alt={product.name} 
          src={product.image || 'https://picsum.photos/400/200'} 
          onClick={() => navigate(`/products/${product.id}`)}
        />
      }
      actions={[
        <Button 
          type="text" 
          icon={<ShoppingCartOutlined />}
          onClick={(e) => handleAddToCart(e, product)}
        >
          加入购物车
        </Button>,
        <Button type="text" icon={<HeartOutlined />} onClick={(e) => {
          e.stopPropagation()
          if (!user) {
            navigate('/login')
            return
          }
          userApi.toggleFavorite(product.id)
        }}>收藏</Button>
      ]}
    >
      <Card.Meta
        title={<div onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
          {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
        </div>}
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <span className="product-price">¥{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="product-original-price">¥{product.originalPrice}</span>
              )}
            </div>
            <Space size={8}>
              {product.category && <Tag color="blue">{product.category.name}</Tag>}
              <Tag color="green">库存: {product.stock}</Tag>
            </Space>
          </Space>
        }
      />
    </Card>
  )

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>商品列表</Title>
        
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space>
              <span style={{ width: 60 }}>分类:</span>
              <Select
                style={{ width: 200 }}
                value={filters.category_id || undefined}
                placeholder="全部分类"
                allowClear
                onChange={(value) => setFilters(f => ({ ...f, category_id: value || '' }))}
              >
                <Select.Option value="">全部分类</Select.Option>
                {categories.map(cat => (
                  <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                ))}
              </Select>
            </Space>
            <Space>
              <span style={{ width: 60 }}>搜索:</span>
              <Input.Search
                placeholder="搜索商品名称..."
                allowClear
                enterButton={<SearchOutlined />}
                value={filters.keyword}
                onSearch={(value) => setFilters(f => ({ ...f, keyword: value }))}
                style={{ width: 400 }}
              />
            </Space>
          </Space>
        </Card>

        {products.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {products.map(product => (
                <Col xs={12} sm={8} md={6} lg={6} key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger
                pageSizeOptions={['12', '20', '40']}
                showTotal={(total) => `共 ${total} 件商品`}
                onChange={(page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize }))}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无商品" />
        )}
      </div>
    </AppLayout>
  )
}

export default ProductList
