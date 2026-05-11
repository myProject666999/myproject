import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Typography, Space, Radio, List, Input, message, Empty } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/Layout'
import { userApi } from '../utils/api'
import { useUserStore } from '../store/useStore'

const { Title, Text } = Typography

function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setCartCount } = useUserStore()
  
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [remark, setRemark] = useState('')

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      const res = await userApi.getAddresses()
      setAddresses(res.data || [])
      const defaultAddr = res.data?.find(addr => addr.is_default === 1) || res.data?.[0]
      setSelectedAddress(defaultAddr)
    } catch (error) {
      console.error(error)
    }
  }

  const getTotalPrice = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleSubmit = async () => {
    if (!selectedAddress) {
      message.warning('请选择收货地址')
      return
    }

    setLoading(true)
    try {
      const data = {
        address_id: selectedAddress.id,
        remark
      }

      if (location.state?.cart_ids) {
        data.cart_ids = location.state.cart_ids
      } else if (location.state?.items) {
        data.items = location.state.items
      }

      const res = await userApi.createOrder(data)
      message.success('订单创建成功')
      
      if (location.state?.cart_ids) {
        const countRes = await userApi.getCartCount()
        setCartCount(countRes.data.count)
      }
      
      navigate(`/profile/orders`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Title level={3}>确认订单</Title>
      
      <Card title="收货地址" style={{ marginBottom: 16 }}>
        {addresses.length > 0 ? (
          <Radio.Group 
            value={selectedAddress?.id}
            onChange={(e) => {
              const addr = addresses.find(a => a.id === e.target.value)
              setSelectedAddress(addr)
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {addresses.map(addr => (
                <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
                  <Radio value={addr.id}>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Text strong>{addr.name}</Text>
                        <Text>{addr.phone}</Text>
                        {addr.is_default === 1 && <Text type="success">[默认地址]</Text>}
                      </Space>
                      <Text type="secondary">
                        {addr.province} {addr.city} {addr.district} {addr.detail}
                      </Text>
                    </Space>
                  </Radio>
                </div>
              ))}
            </Space>
          </Radio.Group>
        ) : (
          <div className="empty-state">
            <Empty description="暂无收货地址" />
            <Button type="primary" onClick={() => navigate('/profile/addresses')}>
              添加收货地址
            </Button>
          </div>
        )}
      </Card>

      <Card title="订单备注" style={{ marginBottom: 16 }}>
        <Input.TextArea 
          rows={3}
          placeholder="选填，如有特殊要求请在此说明"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary">共 {orderItems.length} 件商品</Text>
          </div>
          <Space size="large">
            <Text>合计: <span style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{getTotalPrice().toFixed(2)}</span></Text>
            <Button 
              type="primary" 
              size="large"
              loading={loading}
              onClick={handleSubmit}
            >
              提交订单
            </Button>
          </Space>
        </div>
      </Card>
    </AppLayout>
  )
}

export default Checkout
