import React, { useEffect } from 'react'
import { Layout, Menu, Input, Button, Avatar, Dropdown, Badge, Typography } from 'antd'
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, SettingOutlined, HeartOutlined, FileTextOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/useStore'
import { userApi } from '../utils/api'

const { Header, Content, Footer } = Layout
const { Search } = Input
const { Title } = Typography

function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, cartCount, setCartCount } = useUserStore()

  useEffect(() => {
    if (user) {
      fetchCartCount()
    }
  }, [user])

  const fetchCartCount = async () => {
    try {
      const res = await userApi.getCartCount()
      setCartCount(res.data.count)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(value)}`)
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: <Link to="/profile/orders">我的订单</Link>
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: <Link to="/profile/favorites">我的收藏</Link>
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout className="main-layout">
      <Header className="site-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Link to="/" style={{ color: '#1890ff', fontSize: 20, fontWeight: 'bold' }}>
            🎓 校园闲置交易
          </Link>
          
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={[
              { key: '/', label: <Link to="/">首页</Link> },
              { key: '/products', label: <Link to="/products">商品列表</Link> },
              { key: '/news', label: <Link to="/news">商品资讯</Link> }
            ]}
            style={{ borderBottom: 'none', flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Search
            placeholder="搜索商品..."
            allowClear
            enterButton="搜索"
            size="middle"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />

          <Link to="/cart">
            <Badge count={cartCount}>
              <Button icon={<ShoppingCartOutlined />} type="text">
                购物车
              </Button>
            </Badge>
          </Link>

          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} src={user.avatar} />
                <span>{user.nickname || user.username}</span>
              </div>
            </Dropdown>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </div>
          )}
        </div>
      </Header>

      <Content className="site-content">
        {children}
      </Content>

      <Footer className="site-footer">
        <Title level={5} style={{ color: '#fff', marginBottom: 8 }}>校园闲置物品交易平台</Title>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          © 2024 Campus Idle Goods Trading System. All Rights Reserved.
        </p>
      </Footer>
    </Layout>
  )
}

export default AppLayout
