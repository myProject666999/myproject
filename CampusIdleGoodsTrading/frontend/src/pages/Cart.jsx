import React, { useState, useEffect } from 'react'
import { Table, Button, InputNumber, Card, Typography, Space, Empty, Checkbox, message } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/Layout'
import { userApi } from '../utils/api'
import { useUserStore } from '../store/useStore'

const { Title } = Typography

function Cart() {
  const navigate = useNavigate()
  const { setCartCount } = useUserStore()
  const [cartItems, setCartItems] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const res = await userApi.getCart()
      setCartItems(res.data || [])
      setSelectedRowKeys(res.data?.map(item => item.id) || [])
    } catch (error) {
      console.error(error)
    }
  }

  const updateQuantity = async (id, quantity) => {
    try {
      await userApi.updateCart(id, { quantity })
      loadCart()
    } catch (error) {
      console.error(error)
    }
  }

  const deleteItem = async (id) => {
    try {
      await userApi.deleteCart(id)
      message.success('删除成功')
      loadCart()
      const res = await userApi.getCartCount()
      setCartCount(res.data.count)
    } catch (error) {
      console.error(error)
    }
  }

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedRowKeys.includes(item.id))
  }

  const getTotalPrice = () => {
    return getSelectedItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    const selectedItems = getSelectedItems()
    if (selectedItems.length === 0) {
      message.warning('请选择要结算的商品')
      return
    }

    try {
      const addressesRes = await userApi.getAddresses()
      if (addressesRes.data.length === 0) {
        message.warning('请先添加收货地址')
        navigate('/profile/addresses')
        return
      }

      navigate('/checkout', { 
        state: { 
          cart_ids: selectedItems.map(item => item.id) 
        } 
      })
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: '商品',
      dataIndex: 'product',
      key: 'product',
      render: (product) => (
        <Space>
          <img 
            src={product?.image || 'https://picsum.photos/80/80'} 
            alt={product?.name}
            className="cart-item-image"
          />
          <div>
            <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => navigate(`/products/${product?.id}`)}>
              {product?.name}
            </div>
            <div style={{ color: '#999', fontSize: 12 }}>{product?.description?.substring(0, 50)}...</div>
          </div>
        </Space>
      )
    },
    {
      title: '单价',
      dataIndex: ['product', 'price'],
      key: 'price',
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber 
          min={1} 
          max={record.product?.stock || 999}
          value={quantity}
          onChange={(value) => updateQuantity(record.id, value)}
        />
      )
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          ¥{(record.product?.price * record.quantity).toFixed(2)}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => deleteItem(record.id)}
        >
          删除
        </Button>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }

  return (
    <AppLayout>
      <Title level={3}>我的购物车</Title>
      
      <Card>
        {cartItems.length > 0 ? (
          <>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={cartItems}
              rowKey="id"
              pagination={false}
            />
            
            <div style={{ 
              marginTop: 24, 
              padding: 16, 
              background: '#f5f5f5', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 4
            }}>
              <Space>
                <Checkbox 
                  checked={selectedRowKeys.length === cartItems.length && cartItems.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRowKeys(cartItems.map(item => item.id))
                    } else {
                      setSelectedRowKeys([])
                    }
                  }}
                >
                  全选
                </Checkbox>
                <span>已选 {selectedRowKeys.length} 件商品</span>
              </Space>
              
              <Space size="middle">
                <span>合计: <span style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{getTotalPrice().toFixed(2)}</span></span>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleCheckout}
                  disabled={selectedRowKeys.length === 0}
                >
                  结算
                </Button>
              </Space>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <Empty 
              description="购物车空空如也"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button type="primary" onClick={() => navigate('/products')}>去逛逛</Button>
          </div>
        )}
      </Card>
    </AppLayout>
  )
}

export default Cart
