import React, { useState, useEffect } from 'react'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Card, Avatar, Descriptions, Form, Input, Button, message, Modal, Table, Space, Tag, Empty, Typography, Popconfirm, Tabs, Row, Col, Switch } from 'antd'
import { 
  UserOutlined, ShoppingCartOutlined, HeartOutlined, FileTextOutlined, 
  EnvironmentOutlined, SettingOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SendOutlined, PlusOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import AppLayout from '../components/Layout'
import { userApi } from '../utils/api'
import { useUserStore } from '../store/useStore'

const { Sider, Content } = Layout
const { Title, Text, Paragraph } = Typography

const ORDER_STATUS = {
  0: { label: '待支付', className: 'status-pending' },
  1: { label: '待发货', className: 'status-paid' },
  2: { label: '已发货', className: 'status-shipped' },
  3: { label: '已完成', className: 'status-completed' },
  4: { label: '已退款', className: 'status-refunded' },
  5: { label: '已取消', className: 'status-cancelled' }
}

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUser } = useUserStore()
  
  const [profile, setProfile] = useState(null)
  const [form] = Form.useForm()

  const menuItems = [
    { key: '/profile', icon: <UserOutlined />, label: '个人信息' },
    { key: '/profile/orders', icon: <FileTextOutlined />, label: '我的订单' },
    { key: '/profile/favorites', icon: <HeartOutlined />, label: '我的收藏' },
    { key: '/profile/addresses', icon: <EnvironmentOutlined />, label: '收货地址' },
    { key: '/profile/settings', icon: <SettingOutlined />, label: '账号设置' }
  ]

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await userApi.getProfile()
      setProfile(res.data)
      updateUser(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateProfile = async (values) => {
    try {
      await userApi.updateProfile(values)
      message.success('更新成功')
      loadProfile()
    } catch (error) {
      console.error(error)
    }
  }

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    try {
      await userApi.changePassword({
        old_password: values.oldPassword,
        new_password: values.newPassword
      })
      message.success('密码修改成功')
    } catch (error) {
      console.error(error)
    }
  }

  const ProfileInfo = () => (
    <Card title="个人信息">
      <Descriptions column={2}>
        <Descriptions.Item label="用户名">{profile?.username}</Descriptions.Item>
        <Descriptions.Item label="昵称">{profile?.nickname || '-'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{profile?.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="手机号">{profile?.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="注册时间">{dayjs(profile?.created_at).format('YYYY-MM-DD')}</Descriptions.Item>
      </Descriptions>
    </Card>
  )

  const AccountSettings = () => (
    <div>
      <Card title="修改个人信息" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            nickname: profile?.nickname,
            email: profile?.email,
            phone: profile?.phone
          }}
          onFinish={handleUpdateProfile}
        >
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存修改</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="修改密码">
        <Form layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">修改密码</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )

  const OrderList = () => {
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

    useEffect(() => {
      loadOrders()
    }, [pagination.current, pagination.pageSize, status])

    const loadOrders = async () => {
      setLoading(true)
      try {
        const params = {
          page: pagination.current,
          page_size: pagination.pageSize,
          ...(status && { status })
        }
        const res = await userApi.getOrders(params)
        setOrders(res.data.list || [])
        const newTotal = res.data.total || 0
        setPagination(prev => {
          if (prev.total === newTotal) {
            return prev
          }
          return { ...prev, total: newTotal }
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const handlePay = async (id) => {
      try {
        await userApi.payOrder(id)
        message.success('支付成功')
        loadOrders()
      } catch (error) {
        console.error(error)
      }
    }

    const handleCancel = async (id) => {
      try {
        await userApi.cancelOrder(id)
        message.success('取消成功')
        loadOrders()
      } catch (error) {
        console.error(error)
      }
    }

    const handleConfirm = async (id) => {
      try {
        await userApi.confirmOrder(id)
        message.success('确认收货成功')
        loadOrders()
      } catch (error) {
        console.error(error)
      }
    }

    const handleRefund = async (id) => {
      try {
        await userApi.refundOrder(id)
        message.success('退款申请已提交')
        loadOrders()
      } catch (error) {
        console.error(error)
      }
    }

    const columns = [
      {
        title: '订单号',
        dataIndex: 'order_no',
        key: 'order_no',
        render: (text) => <Text strong>{text}</Text>
      },
      {
        title: '商品',
        key: 'items',
        render: (_, record) => (
          <div>
            {record.items?.slice(0, 2).map(item => (
              <div key={item.id} style={{ marginBottom: 4 }}>
                {item.product_name} × {item.quantity}
              </div>
            ))}
            {record.items?.length > 2 && <Text type="secondary">...</Text>}
          </div>
        )
      },
      {
        title: '金额',
        dataIndex: 'total_price',
        key: 'total_price',
        render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price}</span>
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (s) => (
          <span className={`order-status-badge ${ORDER_STATUS[s]?.className}`}>
            {ORDER_STATUS[s]?.label}
          </span>
        )
      },
      {
        title: '下单时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
      },
      {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space>
            {record.status === 0 && (
              <>
                <Button type="primary" size="small" onClick={() => handlePay(record.id)}>支付</Button>
                <Button size="small" onClick={() => handleCancel(record.id)}>取消</Button>
              </>
            )}
            {record.status === 1 && (
              <Button size="small" onClick={() => handleCancel(record.id)}>取消订单</Button>
            )}
            {record.status === 2 && (
              <Button type="primary" size="small" onClick={() => handleConfirm(record.id)}>确认收货</Button>
            )}
            {(record.status === 1 || record.status === 2) && (
              <Button size="small" danger onClick={() => handleRefund(record.id)}>申请退款</Button>
            )}
          </Space>
        )
      }
    ]

    return (
      <div>
        <Tabs
          activeKey={status}
          onChange={setStatus}
          items={[
            { key: '', label: '全部' },
            { key: '0', label: '待支付' },
            { key: '1', label: '待发货' },
            { key: '2', label: '已发货' },
            { key: '3', label: '已完成' },
            { key: '4', label: '已退款' },
            { key: '5', label: '已取消' }
          ]}
        />
        {orders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
            }}
          />
        ) : (
          <Empty description="暂无订单" />
        )}
      </div>
    )
  }

  const AddressList = () => {
    const [addressModalVisible, setAddressModalVisible] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [addresses, setAddresses] = useState([])
    const [addressForm] = Form.useForm()

    useEffect(() => {
      loadAddresses()
    }, [])

    const loadAddresses = async () => {
      try {
        const res = await userApi.getAddresses()
        setAddresses(res.data || [])
      } catch (error) {
        console.error(error)
      }
    }

    const handleAddAddress = () => {
      setEditingAddress(null)
      addressForm.resetFields()
      setAddressModalVisible(true)
    }

    const handleEditAddress = (address) => {
      setEditingAddress(address)
      addressForm.setFieldsValue({
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        is_default: address.is_default === 1
      })
      setAddressModalVisible(true)
    }

    const handleDeleteAddress = async (id) => {
      try {
        await userApi.deleteAddress(id)
        message.success('删除成功')
        loadAddresses()
      } catch (error) {
        console.error(error)
      }
    }

    const handleSetDefault = async (id) => {
      try {
        await userApi.setDefaultAddress(id)
        message.success('设置成功')
        loadAddresses()
      } catch (error) {
        console.error(error)
      }
    }

    const handleSubmitAddress = async (values) => {
      try {
        const data = {
          ...values,
          is_default: values.is_default ? 1 : 0
        }
        if (editingAddress) {
          await userApi.updateAddress(editingAddress.id, data)
        } else {
          await userApi.createAddress(data)
        }
        message.success(editingAddress ? '更新成功' : '添加成功')
        setAddressModalVisible(false)
        loadAddresses()
      } catch (error) {
        console.error(error)
      }
    }

    return (
      <div>
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAddress}>
            添加地址
          </Button>
        </div>

        {addresses.length > 0 ? (
          <Row gutter={[16, 16]}>
            {addresses.map(addr => (
              <Col span={24} key={addr.id}>
                <div className={`address-card ${addr.is_default === 1 ? 'default' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Space>
                        <Text strong>{addr.name}</Text>
                        <Text>{addr.phone}</Text>
                        {addr.is_default === 1 && <Tag color="blue">默认</Tag>}
                      </Space>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        {addr.province} {addr.city} {addr.district} {addr.detail}
                      </Paragraph>
                    </div>
                    <Space>
                      {addr.is_default !== 1 && (
                        <Button type="link" onClick={() => handleSetDefault(addr.id)}>设为默认</Button>
                      )}
                      <Button type="link" onClick={() => handleEditAddress(addr)}>编辑</Button>
                      <Popconfirm title="确定要删除吗？" onConfirm={() => handleDeleteAddress(addr.id)}>
                        <Button type="link" danger>删除</Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无收货地址" />
        )}

        <Modal
          title={editingAddress ? '编辑地址' : '添加地址'}
          open={addressModalVisible}
          onCancel={() => setAddressModalVisible(false)}
          footer={null}
        >
          <Form form={addressForm} layout="vertical" onFinish={handleSubmitAddress}>
            <Form.Item name="name" label="收货人" rules={[{ required: true, message: '请输入收货人' }]}>
              <Input placeholder="请输入收货人姓名" />
            </Form.Item>
            <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item name="province" label="省">
              <Input placeholder="请输入省份" />
            </Form.Item>
            <Form.Item name="city" label="市">
              <Input placeholder="请输入城市" />
            </Form.Item>
            <Form.Item name="district" label="区/县">
              <Input placeholder="请输入区县" />
            </Form.Item>
            <Form.Item name="detail" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
              <Input.TextArea rows={2} placeholder="请输入详细地址" />
            </Form.Item>
            <Form.Item name="is_default" label="默认地址" valuePropName="checked" initialValue={false}>
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setAddressModalVisible(false)}>取消</Button>
                <Button type="primary" htmlType="submit">保存</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }

  const FavoriteList = () => {
    const [loading, setLoading] = useState(false)
    const [favorites, setFavorites] = useState([])
    const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 })

    useEffect(() => {
      loadFavorites()
    }, [pagination.current, pagination.pageSize])

    const loadFavorites = async () => {
      setLoading(true)
      try {
        const res = await userApi.getFavorites({
          page: pagination.current,
          page_size: pagination.pageSize
        })
        setFavorites(res.data.list || [])
        const newTotal = res.data.total || 0
        setPagination(prev => {
          if (prev.total === newTotal) {
            return prev
          }
          return { ...prev, total: newTotal }
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const handleRemoveFavorite = async (productId) => {
      try {
        await userApi.toggleFavorite(productId)
        message.success('已取消收藏')
        loadFavorites()
      } catch (error) {
        console.error(error)
      }
    }

    return (
      <div>
        {favorites.length > 0 ? (
          <Row gutter={[16, 16]}>
            {favorites.map(fav => (
              <Col xs={12} sm={8} md={6} key={fav.id}>
                <Card
                  hoverable
                  cover={
                    <img 
                      src={fav.product?.image || 'https://picsum.photos/200/200'} 
                      alt={fav.product?.name}
                      style={{ height: 180, objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${fav.product_id}`)}
                    />
                  }
                  actions={[
                    <Popconfirm title="确定取消收藏？" onConfirm={() => handleRemoveFavorite(fav.product_id)}>
                      <Button type="text" danger>取消收藏</Button>
                    </Popconfirm>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div 
                        onClick={() => navigate(`/products/${fav.product_id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {fav.product?.name?.substring(0, 20)}...
                      </div>
                    }
                    description={
                      <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        ¥{fav.product?.price}
                      </span>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无收藏" />
        )}
      </div>
    )
  }

  return (
    <AppLayout>
      <Layout style={{ background: 'transparent' }}>
        <Sider width={200} style={{ background: '#fff', marginRight: 24 }}>
          <div style={{ padding: 24, textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <Avatar size={64} icon={<UserOutlined />} src={profile?.avatar} />
            <div style={{ marginTop: 12, fontWeight: 'bold' }}>
              {profile?.nickname || profile?.username}
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none' }}
          />
        </Sider>
        <Content style={{ background: '#fff', padding: 24, minHeight: 500 }}>
          <Routes>
            <Route path="/" element={<ProfileInfo />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/addresses" element={<AddressList />} />
            <Route path="/favorites" element={<FavoriteList />} />
          </Routes>
        </Content>
      </Layout>
    </AppLayout>
  )
}

export default Profile
