import React, { ReactNode } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  TagOutlined,
  ShopOutlined,
  HeartOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const { Header, Sider, Content } = Layout

const AdminLayout: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    if (location.pathname.includes('dashboard')) return 'dashboard'
    if (location.pathname.includes('users')) return 'users'
    if (location.pathname.includes('categories')) return 'categories'
    if (location.pathname.includes('products')) return 'products'
    if (location.pathname.includes('pets')) return 'pets'
    if (location.pathname.includes('shops')) return 'shops'
    if (location.pathname.includes('orders')) return 'orders'
    return 'dashboard'
  }

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘', onClick: () => navigate('/admin/dashboard') },
    { key: 'users', icon: <UserOutlined />, label: '用户管理', onClick: () => navigate('/admin/users') },
    { key: 'categories', icon: <TagOutlined />, label: '分类管理', onClick: () => navigate('/admin/categories') },
    { key: 'products', icon: <ShoppingOutlined />, label: '商品管理', onClick: () => navigate('/admin/products') },
    { key: 'pets', icon: <HeartOutlined />, label: '宠物管理', onClick: () => navigate('/admin/pets') },
    { key: 'shops', icon: <ShopOutlined />, label: '商店管理', onClick: () => navigate('/admin/shops') },
    { key: 'orders', icon: <OrderedListOutlined />, label: '订单管理', onClick: () => navigate('/admin/orders') },
  ]

  const userMenuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '返回前台',
      onClick: () => navigate('/')
    },
    {
      key: '2',
      type: 'divider' as const,
    },
    {
      key: '3',
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
      <Sider width={200} theme="dark">
        <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          🐾 管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Dropdown menu={{ items: userMenuItems }}>
            <a style={{ cursor: 'pointer' }}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.nickname || user?.username}</span>
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children || <Outlet />}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
