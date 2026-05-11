import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Form, Input, Select, Button, Radio, Typography, Table, Space, message } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api'

const { Title, Text } = Typography

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const [addresses, setAddresses] = useState<any[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const selectedIds = (location.state as any)?.selectedIds || []

  useEffect(() => {
    if (selectedIds.length === 0) {
      navigate('/cart')
      return
    }
    loadAddresses()
    loadCartItems()
  }, [])

  const loadAddresses = async () => {
    try {
      const data = await api.get('/addresses')
      setAddresses(data || [])
    } catch (error) {
      console.error('加载地址失败', error)
    }
  }

  const loadCartItems = async () => {
    try {
      const allItems: any[] = await api.get('/cart')
      const selected = allItems.filter((item: any) => selectedIds.includes(item.id))
      setCartItems(selected)
    } catch (error) {
      console.error('加载购物车失败', error)
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const order = await api.post('/orders', {
        cart_ids: selectedIds,
        shipping_name: values.name,
        shipping_phone: values.phone,
        shipping_address: `${values.province || ''} ${values.city || ''} ${values.district || ''} ${values.detail}`,
        payment_method: values.payment_method,
        remark: values.remark
      })
      message.success('下单成功')
      navigate(`/my-orders`)
    } catch (error: any) {
      message.error(error.message || '下单失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: any) => (
        <Space>
          <img
            src={record.product.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20product%20placeholder&image_size=square'}
            alt={record.product.name}
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
          <Text strong>{record.product.name}</Text>
        </Space>
      )
    },
    {
      title: '单价',
      key: 'price',
      dataIndex: ['product', 'price'],
      render: (price: number) => `¥${price}`
    },
    {
      title: '数量',
      key: 'quantity',
      dataIndex: 'quantity'
    },
    {
      title: '小计',
      key: 'total',
      render: (_: any, record: any) => (
        <Text type="danger">¥{(record.product.price * record.quantity).toFixed(2)}</Text>
      )
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>确认订单</Title>

      <Card title="商品信息" style={{ marginBottom: 24 }}>
        <Table
          dataSource={cartItems}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title="收货信息" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {addresses.length > 0 && (
            <Form.Item label="选择收货地址">
              <Select
                placeholder="选择已有地址"
                onChange={(id) => {
                  const addr = addresses.find((a: any) => a.id === id)
                  if (addr) {
                    form.setFieldsValue({
                      name: addr.name,
                      phone: addr.phone,
                      province: addr.province,
                      city: addr.city,
                      district: addr.district,
                      detail: addr.detail_address
                    })
                  }
                }}
                options={addresses.map((a: any) => ({
                  value: a.id,
                  label: `${a.name} ${a.phone} ${a.province || ''}${a.city || ''}${a.district || ''}${a.detail_address}`
                }))}
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="收货人姓名" rules={[{ required: true }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="province" label="省">
                <Input placeholder="请输入省份" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="市">
                <Input placeholder="请输入城市" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="区/县">
                <Input placeholder="请输入区/县" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="detail" label="详细地址" rules={[{ required: true }]}>
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <Form.Item name="payment_method" label="支付方式" initialValue="online">
            <Radio.Group>
              <Radio value="online">在线支付</Radio>
              <Radio value="wechat">微信支付</Radio>
              <Radio value="alipay">支付宝</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="订单备注（选填）" />
          </Form.Item>

          <Card style={{ marginBottom: 16, textAlign: 'right' }}>
            <Text style={{ fontSize: 18 }}>
              订单总额：<span style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>¥{totalPrice.toFixed(2)}</span>
            </Text>
          </Card>

          <Form.Item>
            <Button type="primary" size="large" htmlType="submit" loading={loading} block>
              提交订单
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Checkout
