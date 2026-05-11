import React, { useEffect, useState } from 'react'
import { Table, Button, Card, Typography, InputNumber, Modal, message, Empty, Select } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getCartList, updateCartItem, removeCartItem, getAddressList, createOrder } from '../utils/api'

const { Title } = Typography

const Cart = () => {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    loadData()
    loadAddresses()
  }, [])

  const loadData = async () => {
    try {
      const res = await getCartList()
      setList(res.data || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const loadAddresses = async () => {
    try {
      const res = await getAddressList()
      setAddresses(res.data || [])
    } catch (error) {
      console.error('Load addresses error:', error)
    }
  }

  const handleQuantityChange = async (id, quantity) => {
    if (quantity < 1) return
    try {
      await updateCartItem(id, { quantity })
      setList(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ))
    } catch (error) {
      console.error('Update cart error:', error)
    }
  }

  const handleRemove = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要从购物车中删除该商品吗？',
      onOk: async () => {
        try {
          await removeCartItem(id)
          setList(prev => prev.filter(item => item.id !== id))
          message.success('删除成功')
        } catch (error) {
          console.error('Remove cart error:', error)
        }
      }
    })
  }

  const totalAmount = list.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (list.length === 0) {
      message.warning('购物车为空')
      return
    }
    
    if (!selectedAddress) {
      message.warning('请选择收货地址')
      return
    }

    try {
      setLoading(true)
      const res = await createOrder({ address_id: selectedAddress })
      message.success('订单创建成功')
      navigate(`/my/orders`)
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="price">¥{price}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber 
          min={1} 
          value={quantity} 
          onChange={(v) => handleQuantityChange(record.id, v)}
        />
      )
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => <span className="price">¥{(record.price * record.quantity).toFixed(2)}</span>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.id)}
        >
          删除
        </Button>
      )
    }
  ]

  const data = list.map(item => ({
    key: item.id,
    ...item,
    name: '报名项目',
    price: item.price || 0
  }))

  return (
    <div>
      <Title level={2} className="section-title">我的购物车</Title>
      
      <Card>
        {list.length === 0 ? (
          <Empty 
            description="购物车是空的，快去选购课程吧"
            icon={<ShoppingCartOutlined style={{ fontSize: 64, color: '#999' }} />}
          >
            <Button type="primary" onClick={() => navigate('/projects')}>去选购</Button>
          </Empty>
        ) : (
          <>
            <Table 
              columns={columns} 
              dataSource={data}
              pagination={false}
            />
            
            <div style={{ marginTop: 24, padding: 20, background: '#fafafa', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span>请选择收货地址：</span>
                <Select
                  style={{ width: 300 }}
                  placeholder="选择收货地址"
                  value={selectedAddress}
                  onChange={setSelectedAddress}
                  options={addresses.map(addr => ({
                    value: addr.id,
                    label: `${addr.name} ${addr.phone} - ${addr.province}${addr.city}${addr.district}${addr.detail}`
                  }))}
                />
                <Button onClick={() => navigate('/my/addresses')}>管理地址</Button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  共 <strong>{list.reduce((sum, item) => sum + item.quantity, 0)}</strong> 件商品
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    合计：<span className="price" style={{ fontSize: 28 }}>¥{totalAmount.toFixed(2)}</span>
                  </div>
                  <Button 
                    type="primary" 
                    size="large"
                    loading={loading}
                    onClick={handleCheckout}
                  >
                    去结算
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default Cart
