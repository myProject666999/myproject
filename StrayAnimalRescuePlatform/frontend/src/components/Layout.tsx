import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  ShopOutlined,
  HeartOutlined,
  SearchOutlined,
  MessageOutlined,
  ReadOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Header, Content, Footer } = Layout

const LayoutComponent = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    if (location.pathname === '/') return 'home'
    if (location.pathname.startsWith('/products')) return 'products'
    if (location.pathname.startsWith('/pets')) return 'pets'
    if (location.pathname.startsWith('/shops')) return 'shops'
    if (location.pathname.startsWith('/lost-pets')) return 'lost-pets'
    if (location.pathname.startsWith('/forum')) return 'forum'
    if (location.pathname.startsWith('/news')) return 'news'
    return 'home'
  }

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
    { key: 'products', icon: <ShopOutlined />, label: '宠物用品', onClick: () => navigate('/products') },
    { key: 'pets', icon: <HeartOutlined />, label: '宠物领养', onClick: () => navigate('/pets') },
    { key: 'shops', icon: <ShopOutlined />, label: '宠物商店', onClick: () => navigate('/shops') },
    { key: 'lost-pets', icon: <SearchOutlined />, label: '宠物挂失', onClick: () => navigate('/lost-pets') },
    { key: 'forum', icon: <MessageOutlined />, label: '宠物论坛', onClick: () => navigate('/forum') },
    { key: 'news', icon: <ReadOutlined />, label: '宠物资讯', onClick: () => navigate('/news') },
  ]

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: '2',
      icon: <ShoppingCartOutlined />,
      label: '我的订单',
      onClick: () => navigate('/my-orders')
    },
    {
      key: '3',
      icon: <ShoppingCartOutlined />,
      label: '购物车',
      onClick: () => navigate('/cart')
    },
    {
      key: '4',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/my-favorites')
    },
    ...(user?.role === 'admin' ? [{
      key: '5',
      icon: <DashboardOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin/dashboard')
    }] : []),
    {
      key: '6',
      type: 'divider' as const,
    },
    {
      key: '7',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          🐾 流浪动物救助
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, background: 'transparent' }}
        />
        <Space size={16}>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }}>
              <a style={{ color: 'white', cursor: 'pointer' }}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.nickname || user.username}</span>
                </Space>
              </a>
            </Dropdown>
          ) : (
            <Space>
              <a style={{ color: 'white' }} onClick={() => navigate('/login')}>登录</a>
              <a style={{ color: 'white' }} onClick={() => navigate('/register')}>注册</a>
            </Space>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        流浪动物救助平台 ©2026 Created by Stray Animal Rescue Team
      </Footer>
    </Layout>
  )
}

export default LayoutComponent
