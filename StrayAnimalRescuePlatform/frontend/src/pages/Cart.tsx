import React, { useEffect, useState } from 'react'
import { Table, Button, Typography, InputNumber, Checkbox, message, Empty, Space } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const data = await api.get('/cart')
      setCartItems(data || [])
    } catch (error) {
      console.error('加载购物车失败', error)
    }
  }

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return
    try {
      await api.put(`/cart/${id}`, { quantity })
      loadCart()
    } catch (error: any) {
      message.error(error.message || '更新失败')
    }
  }

  const removeItem = async (id: number) => {
    try {
      await api.delete(`/cart/${id}`)
      setSelectedIds(selectedIds.filter(i => i !== id))
      message.success('已删除')
      loadCart()
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id))
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const columns = [
    {
      title: '选择',
      key: 'select',
      render: (_: any, record: any) => (
        <Checkbox
          checked={selectedIds.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds([...selectedIds, record.id])
            } else {
              setSelectedIds(selectedIds.filter(id => id !== record.id))
            }
          }}
        />
      ),
      width: 60
    },
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: any) => (
        <Space>
          <img
            src={record.product.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20product%20placeholder&image_size=square'}
            alt={record.product.name}
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
          />
          <div>
            <Text strong>{record.product.name}</Text>
            <br />
            <Text type="secondary">{record.product.product_category?.name}</Text>
          </div>
        </Space>
      )
    },
    {
      title: '单价',
      key: 'price',
      dataIndex: ['product', 'price'],
      render: (price: number) => <Text type="danger" style={{ fontSize: 16 }}>¥{price}</Text>
    },
    {
      title: '数量',
      key: 'quantity',
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => updateQuantity(record.id, val)}
        />
      )
    },
    {
      title: '小计',
      key: 'total',
      render: (_: any, record: any) => (
        <Text type="danger" style={{ fontSize: 16 }}>¥{(record.product.price * record.quantity).toFixed(2)}</Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.id)}>
          删除
        </Button>
      )
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <ShoppingCartOutlined /> 购物车
      </Title>

      {cartItems.length === 0 ? (
        <Empty description="购物车是空的">
          <Button type="primary" onClick={() => navigate('/products')}>去逛逛</Button>
        </Empty>
      ) : (
        <>
          <Table
            dataSource={cartItems}
            columns={columns}
            rowKey="id"
            pagination={false}
          />

          <Card style={{ marginTop: 24, textAlign: 'right' }}>
            <Space size={24}>
              <Checkbox
                checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(cartItems.map(item => item.id))
                  } else {
                    setSelectedIds([])
                  }
                }}
              >
                全选
              </Checkbox>
              <Text>已选 {selectedIds.length} 件商品</Text>
              <Text style={{ fontSize: 18 }}>
                合计：<span style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{totalPrice.toFixed(2)}</span>
              </Text>
              <Button
                type="primary"
                size="large"
                disabled={selectedIds.length === 0}
                onClick={() => {
                  if (selectedIds.length === 0) {
                    message.warning('请选择要结算的商品')
                    return
                  }
                  navigate('/checkout', { state: { selectedIds } })
                }}
              >
                结算
              </Button>
            </Space>
          </Card>
        </>
      )}
    </div>
  )
}

export default Cart
